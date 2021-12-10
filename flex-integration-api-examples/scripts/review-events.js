require('dotenv').config();
const fs = require('fs');

const sharetribeSdk = require('sharetribe-flex-sdk');

// Create new SDK instance
const sdk = sharetribeSdk.createInstance({
  clientId: '0fd1e949-51a4-4fe0-813e-7d585a661ec5'
});

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

const analyzeEvent = (event) => {
    if (event.attributes.resourceType == "ofProvider") {
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

        const cekaj =  () => {
           sdk.listings.show({ id: listingId }).then(res => {
            console.log(res, '-------------LISTING--------------------')
          });
          console.log(previousValues.attributes.rating)
        }
        cekaj();

        const isPublic = reviewState === "public";
        const isPending = reviewState === "pending";
        const ratingOverAllPoints= ratingOverAllPoints + newRating;
        const ratingOverAllTimes= ratingOverAllTimes + 1;
        const rating= ratingOverAllPoints / ratingOverAllTimes;

        switch (eventType) {
            case "review/created":
                if (isPublic) {
                    console.log(`A review has been created ${listingDetails}`)

                    // integrationSdk.listings.update({
                    //     id: new UUID(listingId),
                    //       metadata: {
                    //       rating: rating
                    //     },
                    //   }, {
                    //     expand: true,
                    //   }).then(res => {
                    //     // res.data
                    //   });
                     sdk.listings.show({ id: listingId }).then(res => {
                      console.log(res, '-------------LISTING CREATED--------------------')
                    });
                    console.log(previousValues.attributes.rating)

                }
                break;
            case "review/updated":
                if (isPublic) {
                  console.log(res, '-------------LISTING UPDATED--------------------')
                }
                break;
            case "review/deleted":
                if (isPublic) {
                  console.log(res, '-------------LISTING DELATED--------------------')
                }
                break;
            case "review/pending":
                if (isPending) {
                  console.log(res, '-------------LISTING PENDING--------------------')
                }
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