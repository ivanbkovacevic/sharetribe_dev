import { createInstance } from 'sharetribe-flex-sdk';
import { types as sdkTypes } from './util/sdkLoader';

const { LatLng, LatLngBounds } = sdkTypes;
const { Money, UUID } = sdkTypes;
let userWishList = [{}];


export let wishList1 =
{
  id: new UUID("c6ff7190-bdf7-47a0-8a2b-e3136e74334f"),
  type: "listing",
  attributes: {
    description: "7-speed2222222222 Hybrid",
    deleted: false,
    geolocation: new LatLng(40.64542, -74.08508),
    createdAt: new Date("2018-03-23T08:40:24.443Z"),
    state: "published",
    title: "Peugeot eT101",
    availabilityPlan: {
      type: "availability-plan/day"
    },
    publicData: {
      address: {
        city: "New York",
        country: "USA",
        state: "NY",
        street: "230 Hamilton Ave"
      },
      category: "road",
      gears: 22,
      rules: "This is a nice, bike! Please, be careful with it."
    },
    metadata: {
      promoted: true
    },
    price: new Money(111, "EUR"),
  },
}

wishList1 = JSON.stringify(wishList1);



// Create new SDK instance
const sdk = createInstance({
  clientId: '050e5159-2efe-45c5-b0e1-f2fcf5a31f70'
});


export const createListing = () => {
  sdk.ownListings.create({
    title: "FERARRI",
    description: "7-speed Hybrid",
    geolocation: new LatLng(40.64542, -74.08508),
    availabilityPlan: {
      type: "availability-plan/day",
      entries: [
        {
          dayOfWeek: "mon",
          seats: 3
        },
        {
          dayOfWeek: "fri",
          seats: 1
        }
      ]
    },
    privateData: {
      externalServiceId: "abcd-service-id-1234"
    },
    publicData: {
      address: {
        city: "New York",
        country: "USA",
        state: "NY",
        street: "230 Hamilton Ave"
      },
      category: "road",
      gears: 22,
      rules: "This is a nice, bike! Please, be careful with it."
    },
    price: new Money(1590, "USD"),
    images: [

    ]
  }, {
    expand: true,
    include: ["images"]
  }).then(res => {
    console.log(res.data)
  });
}
///////////////////////////////////////////////////

export const showListing = (listingId) => {
  sdk.listings.show({ id: listingId }).then(res => {
    console.log('SHOW LISTING', res.data)
  });
}

showListing('61b0a902-f813-49a1-8c39-2c5dbfb9c59c')
export const showWishList = async () => {
  let wishListToShow = [];
  return sdk.currentUser.show().then(res => {
    userWishList = res.data.data.attributes.profile.privateData.wishList;
    
    userWishList.forEach(async (wishId) => {
      sdk.listings.show({ id: wishId }).then(res => {
        let response = res.data.data
        wishListToShow.push(response)
      });
    })
    return Promise.resolve(wishListToShow);
  });

}

export const addToWishList = async (listingId) => {
  await sdk.currentUser.show().then(res => {
    // res.data contains the response data
    console.log('CURETN USER', res)

    userWishList = res.data.data.attributes.profile.privateData.wishList
    console.log(userWishList, 'uuuuuuuuuuuuuuuuu')
  });

  if (userWishList.some((el) => listingId === el) === true) {
    console.log('already in there')
    return
  } else {
    userWishList = [...userWishList, listingId];
  }

  sdk.currentUser.updateProfile({
    privateData: {
      wishList: userWishList,
    },
  }, {
    expand: true
  }).then(res => {
    // res.data
    console.log('Added LISTING to USER wishList', res)
  });
}

export const removeFromWishList = async (listingId) => {
  await sdk.currentUser.show().then(res => {
    // res.data contains the response data
    console.log('CURRETN USER', res)
    userWishList = res.data.data.attributes.profile.privateData.wishList
  });

  userWishList = userWishList.filter((wish) => {
    return wish !== listingId
  })

  sdk.currentUser.updateProfile({
    privateData: {
      wishList: userWishList,
    },
  }, {
    expand: true
  }).then(res => {
    // res.data
    console.log('REMOVED LISTING from USER wishList', res)
  });
}

export const showCurrentUser = () => {
  sdk.currentUser.show().then(res => {
    // res.data contains the response data
    console.log('CURETN USER', res)
  });
}

// const odmah = () => {
//     sdk.currentUser.updateProfile({
//         privateData: {
//           wishList: [],
//         },
//       }, {
//         expand: true
//       }).then(res => {
//         // res.data
//         console.log('ODMAHHHHHHHHHHHREMOVED LISTING from USER wishList', res)
//       });
//     }

//  odmah();