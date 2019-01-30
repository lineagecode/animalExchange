/*
 Copyright 2018 IBM All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

/*
	This is an sample chaincode that tests very begining of lineagecode Framework
  I modify a source from IBM developers channel 
  https://developer.ibm.com/patterns/car-auction-network-hyperledger-fabric-node-sdk-starter-plan/
*/


'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  /**
   * The Init method is called when the Smart Contract 'animalauction' is instantiated by the 
   * blockchain network. Best practice is to have any Ledger initialization in separate
   * function -- see initLedger()
   */
  async Init(stub) {
    console.info('=========== Instantiated fabanimal chaincode ===========');
    return shim.success();
  }
  /**
   * The Invoke method is called as a result of an application request to run the 
   * Smart Contract 'animalauction'. The calling application program has also specified 
   * the particular smart contract function to be called, with arguments
   */
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.info(err);
      return shim.error(err);
    }
  }

  /**
   * The initLedger method is called as a result of instantiating chaincode. 
   * It can be thought of as a constructor for the network. For this network 
   * we will create 3 members, a animal, and a animal listing.
   */
  async initLedger(stub, args) {
    console.info('============= START : Initialize Ledger ===========');

    let member1 = {};
    member1.balance = 5000;
    member1.firstName = 'firstname1';
    member1.lastName = 'lastname1';
    console.info('======After member ===========');

    let member2 = {};
    member2.balance = 5000;
    member2.firstName = 'firstname2';
    member2.lastName = 'lastname2';

    let member3 = {};
    member3.balance = 5000;
    member3.firstName = 'firstname3';
    member3.lastName = 'firstname3';

    let animal = {};
    animal.owner = 'memberA@lineagecodemember';

    let animalListing = {};
    animalListing.reservePrice = 3500;
    animalListing.description = 'the fastest horse in the world';
    animalListing.species = 'Horse';
    animalListing.listingState = 'FOR_SALE';
    animalListing.offers = '';
    animalListing.animal = 'animalname';

    await stub.putState('memberA@lineagecodemember', Buffer.from(JSON.stringify(member1)));
    await stub.putState('memberB@lineagecodemember', Buffer.from(JSON.stringify(member2)));
    await stub.putState('memberC@lineagecodemember', Buffer.from(JSON.stringify(member3)));
    await stub.putState('1234', Buffer.from(JSON.stringify(animal)));
    await stub.putState('ABCD', Buffer.from(JSON.stringify(animalListing)));

    console.info('============= END : Initialize Ledger ===========');
  }

  /**
 * Create a animal object in the state  
 * @param arg[0] - key for the animal (animal id number)
 * @param arg[1] - owner of the animal - should reference the email of a member
 * onSuccess - create and update the state with a new animal object  
 */
  async createAnimal(stub, args) {
    console.info('============= START : Create animal ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    var animal = {
      owner: args[1]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(animal)));
    console.info('============= END : Create animal ===========');
  }

  /**
   * Query the state of the blockchain by passing in a key  
   * @param arg[0] - key to query 
   * @return value of the key if it exists, else return an error 
   */
  async query(stub, args) {
    console.info('============= START : Query method ===========');
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let query = args[0];

    let queryAsBytes = await stub.getState(query); //get the animal from chaincode state
    if (!queryAsBytes || queryAsBytes.toString().length <= 0) {
      throw new Error('key' + ' does not exist: ');
    }
    console.info('query response: ');
    console.info(queryAsBytes.toString());
    console.info('============= END : Query method ===========');

    return queryAsBytes;

  }

  /**
   * Create a animal listing object in the state  
   * @param arg[0] - key for the animal listing (listing number)
   * @param arg[1] - reservePrice, or the minimum acceptable offer for a animal
   * @param arg[2] - description of the object
   * @param arg[3] - state of the listing, can be 'FOR_SALE', 'RESERVE_NOT_MET', or 'SOLD'
   * @param arg[4] - an array of offers for this particular listing
   * @param arg[5] - reference to the animal id (vin) which is to be put on auction
   * onSuccess - create and update the state with a new animal listing object  
   */
  async createAnimal(stub, args) {
    console.info('============= START : Create animal ===========');
    if (args.length != 7) {
      throw new Error('Incorrect number of arguments. Expecting 7 arguments');
    }

    var animalListing = {
      reservePrice: args[1],
      description: args[2],
      listingState: args[3],
      offers: args[4],
      animal: args[5],
      species: args[6],
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(animalListing)));
    console.info('============= END : Create animal ===========');
  }

  /**
   * Create a member object in the state  
   * @param arg[0] - key for the member (email)
   * @param arg[1] - first name of member
   * @param arg[2] - last name of member
   * @param arg[3] - balance: amount of money in member's account
   * onSuccess - create and update the state with a new member  object  
   */
  async createMember(stub, args) {
    console.info('============= START : Create animal ===========');
    if (args.length != 4) {
      throw new Error('Incorrect number of arguments. Expecting 4');
    }

    var member = {
      firstName: args[1],
      lastName: args[2],
      balance: args[3]
    };

    console.info(member);

    await stub.putState(args[0], Buffer.from(JSON.stringify(member)));
    console.info('============= END : Create animal ===========');
  }

  /**
   * Create a offer object in the state, and add it to the array of offers for that listing  
   * @param arg[0] - bid price in the offer - how much bidder is willing to pay
   * @param arg[1] - listingId: reference to a listing in the state
   * @param arg[2] - member email: reference to member which does not own animal
   * onSuccess - create and update the state with a new offer object  
   */
  async makeOffer(stub, args) {
    console.info('============= START : Create animal ===========');
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting 3');
    }

    var offer = {
      bidPrice: args[0],
      listing: args[1],
      member: args[2]
    };

    let listing = args[1];
    console.info('listing: ' + listing);

    //get reference to listing, to add the offer to the listing later
    let listingAsBytes = await stub.getState(listing);
    if (!listingAsBytes || listingAsBytes.toString().length <= 0) {
      throw new Error('listing does not exist');
    }
    listing = JSON.parse(listingAsBytes);

    //get reference to animal, to update it's owner later
    let animalAsBytes = await stub.getState(listing.animal);
    if (!animalAsBytes || animalAsBytes.toString().length <= 0) {
      throw new Error('animal does not exist');
    }

    let animal = JSON.parse(animalAsBytes);

    //get reference to member to ensure enough balance in their account to make the bid
    let memberAsBytes = await stub.getState(offer.member);
    if (!memberAsBytes || memberAsBytes.toString().length <= 0) {
      throw new Error('member does not exist: ');
    }
    let member = JSON.parse(memberAsBytes);

    //check to ensure bidder has enough balance to make the bid
    if (member.balance < offer.bidPrice) {
      throw new Error('The bid is higher than the balance in your account!');
    }

    console.info('animal: ');
    console.info(util.inspect(animal, { showHidden: false, depth: null }));
    console.info('offer: ');
    console.info(util.inspect(offer, { showHidden: false, depth: null }));

    //check to ensure bidder can't bid on own item
    if (animal.owner == offer.member) {
      throw new Error('owner cannot bid on own item!');
    }

    console.info('listing response before pushing to offers: ');
    console.info(listing);

    //check to see if array is null - if so, we have to create an empty one, otherwise we can just push straight to it
    if (!listing.offers) {
      console.info('there are no offers!');
      listing.offers = [];
    }
    listing.offers.push(offer);

    console.info('listing response after pushing to offers: ');
    console.info(listing);

    //update the listing - use listingId as key(args[1]), and listing object as value
    await stub.putState(args[1], Buffer.from(JSON.stringify(listing)));

    console.info('============= END : MakeOffer method ===========');

  }

  /** 
   * Close the bidding for a animal listing and choose the
   * highest bid as the winner. 
   * @param arg[0] - listingId - a reference to our animalListing
   * onSuccess - changes the ownership of the animal on the auction from the original
   * owner to the highest bidder. Subtracts the bid price from the highest bidder 
   * and credits the account of the seller. Updates the state to include the new 
   * owner and the resulting balances. 
   */
  async closeBidding(stub, args) {
    console.info('============= START : Close bidding ===========');
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let listingKey = args[0];

    //check if listing exists
    let listingAsBytes = await stub.getState(listingKey);
    if (!listingAsBytes || listingAsBytes.toString().length <= 0) {
      throw new Error('listing does not exist: ');
    }
    console.info('============= listing exists ===========');

    var listing = JSON.parse(listingAsBytes);
    console.info('listing: ');
    console.info(util.inspect(listing, { showHidden: false, depth: null }));
    listing.listingState = 'RESERVE_NOT_MET';
    let highestOffer = null;

    //can only close bidding if there are offers
    if (listing.offers && listing.offers.length > 0) {

      //use built in JavaScript array sort method - returns highest value at the first index - i.e. highest bid
      listing.offers.sort(function (a, b) {
        return (b.bidPrice - a.bidPrice);
      });

      //get a reference to our highest offer - this object includes the bid price as one of its fields
      highestOffer = listing.offers[0];
      console.info('highest Offer: ' + highestOffer);

      //bid must be higher than reserve price, otherwise we can not sell the animal
      if (highestOffer.bidPrice >= listing.reservePrice) {
        let buyer = highestOffer.member;

        console.info('highestOffer.member: ' + buyer);

        //get the buyer i.e. the highest bidder on the animal
        let buyerAsBytes = await stub.getState(buyer);
        if (!buyerAsBytes || buyerAsBytes.toString().length <= 0) {
          throw new Error('animal does not exist: ');
        }

        //save a reference of the buyer for later - need this reference to update account balance
        buyer = JSON.parse(buyerAsBytes);
        console.info('buyer: ');
        console.info(util.inspect(buyer, { showHidden: false, depth: null }));

        //get reference to animal so we can get the owner i.e. the seller 
        let animalAsBytes = await stub.getState(listing.animal);
        if (!animalAsBytes || animalAsBytes.toString().length <= 0) {
          throw new Error('animal does not exist: ');
        }

        //now that we have the reference to the animal object, 
        //we can find the owner of the animal bc the animal object has a field for owner
        var animal = JSON.parse(animalAsBytes);

        //get reference to the owner of the animal i.e. the seller
        let sellerAsBytes = await stub.getState(animal.owner);
        if (!sellerAsBytes || sellerAsBytes.toString().length <= 0) {
          throw new Error('animal does not exist: ');
        }

        //the seller is the current animal owner
        let seller = JSON.parse(sellerAsBytes);

        console.info('seller: ');
        console.info(util.inspect(seller, { showHidden: false, depth: null }));

        console.info('#### seller balance before: ' + seller.balance);

        //ensure all strings get converted to ints
        let sellerBalance = parseInt(seller.balance, 10);
        let highOfferBidPrice = parseInt(highestOffer.bidPrice, 10);
        let buyerBalance = parseInt(buyer.balance, 10);

        //increase balance of seller
        sellerBalance += highOfferBidPrice;
        seller.balance = sellerBalance;

        console.info('#### seller balance after: ' + seller.balance);
        console.info('#### buyer balance before: ' + buyerBalance);

        //decrease balance of buyer by the amount of the bid price
        buyerBalance -= highestOffer.bidPrice;
        buyer.balance = buyerBalance;

        console.info('#### buyer balance after: ' + buyerBalance);
        console.info('#### buyer balance after: ' + buyerBalance);
        console.info('#### animal owner before: ' + animal.owner);

        //need reference to old owner so we can update their balance later
        let oldOwner = animal.owner;

        //assign person with highest bid as new owner
        animal.owner = highestOffer.member;

        console.info('#### animal owner after: ' + animal.owner);
        console.info('#### buyer balance after: ' + buyerBalance);
        listing.offers = null;
        listing.listingState = 'SOLD';

        //update the balance of the buyer 
        await stub.putState(highestOffer.member, Buffer.from(JSON.stringify(buyer)));

        console.info('old owner: ');
        console.info(util.inspect(oldOwner, { showHidden: false, depth: null }));

        //update the balance of the seller i.e. old owner
        await stub.putState(oldOwner, Buffer.from(JSON.stringify(seller)));

        //update the listing, use listingId as key, and the listing object as the value
        await stub.putState(listingKey, Buffer.from(JSON.stringify(listing)));
      }
    }
    console.info('inspecting animal: ');
    console.info(util.inspect(animal, { showHidden: false, depth: null }));

    if (highestOffer) {
      //update the owner of the animal
      await stub.putState(listing.animal, Buffer.from(JSON.stringify(animal)));
    } else { throw new Error('offers do not exist: '); }

    console.info('============= END : closeBidding ===========');
  }
};

shim.start(new Chaincode()); 
