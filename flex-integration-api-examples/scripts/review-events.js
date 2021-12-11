require('dotenv').config();
const fs = require('fs');

// const sharetribeSdk = require('sharetribe-flex-sdk');

// // Create new SDK instance
// const sdk = sharetribeSdk.createInstance({
//     clientId: '0fd1e949-51a4-4fe0-813e-7d585a661ec5'
// });

const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

const integrationSdk = flexIntegrationSdk.createInstance({
    // These two env vars need to be set in the `.env` file.
    clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
    clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,

    // Normally you can just skip setting the base URL and just use the
    // default that the `createInstance` uses. We explicitly set it here
    // for local testing and development.
    baseUrl: process.env.FLEX_INTEGRATION_BASE_URL || 'https://flex-integ-api.sharetribe.com',
});

const startTime = new Date();
const pollIdleWait = 10000;
// Polling interval (in ms) when a full page of events is received and there may be more
const pollWait = 250;

const stateFile = "./notify-new-review.state";

const queryEvents = (args) => {
    var filter = { eventTypes: "review/created,review/deleted,review/updated" };
    return integrationSdk.events.query(
        { ...args, ...filter }
    );
};

const saveLastEventSequenceId = (sequenceId) => {
    try {
        fs.writeFileSync(stateFile, toString(sequenceId));
    } catch (err) {
        throw err;
    }
};

const loadLastEventSequenceId = () => {
    try {
        const data = fs.readFileSync(stateFile);
        return parseInt(data, 10);
    } catch (err) {
        return null;
    }
};

let rating = {
    ratingScore: 0,
    ratingAllPoints: 0,
    numbOfTimesRated: 1
}

const analyzeEvent = (event) => {
    if (event.attributes.resourceType == "review") {
        const {
            resourceId,
            resource: listing,
            previousValues,
            eventType,
        } = event.attributes;

        const listingId = resourceId.uuid;
        const authorId = listing.relationships.author.data.id.uuid;
        const reviewState = listing.attributes.state;

        const listingDetails = `listing ID ${listingId}, author ID: ${authorId}`;
        const { state: previousState } = previousValues.attributes || {};

        const listingIdRelationship = listing.relationships.listing.data.id.uuid;
        //from review object
        let currentReviewRating = listing.attributes.rating;
        //

        
            integrationSdk.listings.show({ id: listingIdRelationship }).then((res)=>{
                if (res.data.data.attributes.publicData.numbOfTimesRated > 0) {
                    rating.ratingScore = res.data.data.attributes.publicData.rating;
                    rating.ratingAllPoints = res.data.data.attributes.publicData.ratingAllPoints;
                    rating.numbOfTimesRated = res.data.data.attributes.publicData.numbOfTimesRated;
                }

            })    

        switch (eventType) {
            case "review/created":
                rating.ratingAllPoints += currentReviewRating;
                rating.numbOfTimesRated += 1;
                rating.ratingScore = Math.floor(ratingAllPoints / numbOfTimesRated);

                integrationSdk.listings.update({
                    id: listingIdRelationship,
                    publicData: {
                        rating: rating.ratingScore,
                        ratingAllPoints: rating.ratingAllPoints,
                        numbOfTimesRated: rating.numbOfTimesRated,
                    }
                }).then(res => {
                })
                console.log('-------------LISTING CREATED--------------------')
                break;

            case "review/updated":
                rating.ratingAllPoints += currentReviewRating;
                rating.ratingScore = Math.floor(rating.ratingAllPoints / rating.numbOfTimesRated);
                integrationSdk.listings.update({
                    id: listingIdRelationship,
                    publicData: {
                        rating: rating.ratingScore,
                        ratingAllPoints: rating.ratingAllPoints,
                        numbOfTimesRated: rating.numbOfTimesRated,
                    }
                }).then(res => {
                    console.log(res.publicData)
                })
                console.log('-------------LISTING UPDATED--------------------')
                console.log('-------------LISTING UPDATED--------------------')
                break;
            case "review/deleted":
                rating.ratingAllPoints -= currentReviewRating;
                rating.numbOfTimesRated -= 1;
                rating.ratingScore = Math.floor(rating.ratingAllPoints / rating.numbOfTimesRated);
                integrationSdk.listings.update({
                    id: listingIdRelationship,
                    publicData: {
                        rating: rating.ratingScore,
                        ratingAllPoints: rating.ratingAllPoints,
                        numbOfTimesRated: rating.numbOfTimesRated,
                    }
                }).then(res => {
                })
                console.log('-------------LISTING DELATED--------------------')
                break;
        }
    }
};

const pollLoop = (sequenceId) => {
    var params = sequenceId ? { startAfterSequenceId: sequenceId } : { createdAtStart: startTime };
    queryEvents(params)
        .then(res => {
            const events = res.data.data;
            const lastEvent = events[events.length - 1];
            const fullPage = events.length === res.data.meta.perPage;
            const delay = fullPage ? pollWait : pollIdleWait;
            const lastSequenceId = lastEvent ? lastEvent.attributes.sequenceId : sequenceId;

            events.forEach(e => {
                analyzeEvent(e);
            });

            if (lastEvent) saveLastEventSequenceId(lastEvent.attributes.sequenceId);

            setTimeout(() => { pollLoop(lastSequenceId); }, delay);
        });
};

const lastSequenceId = loadLastEventSequenceId();

console.log("Press <CTRL>+C to quit.");
if (lastSequenceId) {
    console.log(`Resuming event polling from last seen event with sequence ID ${lastSequenceId}`);
} else {
    console.log("No state found or failed to load state.");
    console.log("Starting event polling from current time.");
}

pollLoop(lastSequenceId);