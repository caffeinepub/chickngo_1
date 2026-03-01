import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  type Points = Nat;
  type PointsReward = Nat;
  type OfferId = Nat;

  type User = {
    username : Text;
    passwordHash : Text; // Store hashed passwords in production
  };

  type Customer = {
    name : Text;
    mobile : Text;
    points : Points;
  };

  type Offer = {
    id : OfferId;
    name : Text;
    requiredPoints : PointsReward;
    rewardDescription : Text;
  };

  var nextOfferId = 0;
  let users = Map.empty<Principal, User>();
  let customers = Map.empty<Principal, Customer>();
  let offers = Map.empty<OfferId, Offer>();

  // Authentication
  module Auth {
    public func login(username : Text, password : Text) : Bool {
      for ((_, user) in users.entries()) {
        if (user.username == username and user.passwordHash == password) {
          // Add proper password hashing in production
          return true;
        };
      };
      false;
    };
  };

  // Customer Points Management
  module CustomerPoints {
    public func addPoints(customerPrincipal : Principal, points : Points) {
      switch (customers.get(customerPrincipal)) {
        case (null) { Runtime.trap("Customer does not exist") };
        case (?customer) {
          let updatedCustomer : Customer = {
            customer with
            points = customer.points + points;
          };
          customers.add(customerPrincipal, updatedCustomer);
        };
      };
    };

    public func getPoints(customerPrincipal : Principal) : Points {
      switch (customers.get(customerPrincipal)) {
        case (null) { 0 };
        case (?customer) { customer.points };
      };
    };
  };

  // Offers Management
  module Offers {
    public func addOffer(name : Text, requiredPoints : PointsReward, rewardDescription : Text) : OfferId {
      let offerId = nextOfferId;
      let offer : Offer = {
        id = offerId;
        name;
        requiredPoints;
        rewardDescription;
      };
      offers.add(offerId, offer);
      offerId;
    };

    public func deleteOffer(offerId : OfferId) {
      if (not offers.containsKey(offerId)) { Runtime.trap("Offer does not exist") };
      offers.remove(offerId);
    };

    public func redeemOffer(customerPrincipal : Principal, offerId : OfferId) {
      let offer = switch (offers.get(offerId)) {
        case (null) { Runtime.trap("Offer does not exist") };
        case (?offer) { offer };
      };
      let customer = switch (customers.get(customerPrincipal)) {
        case (null) { Runtime.trap("Customer does not exist") };
        case (?customer) { customer };
      };
      if (customer.points < offer.requiredPoints) {
        Runtime.trap("Insufficient points to redeem offer.");
      };
      let updatedCustomer = {
        customer with
        points = customer.points - offer.requiredPoints;
      };
      customers.add(customerPrincipal, updatedCustomer);
    };

    public func getAllOffers() : [Offer] {
      offers.values().toArray();
    };
  };

  // Export to Smart Contract
  public shared ({ caller }) func initialize() : async () {
    users.add(caller, {
      username = "admin";
      passwordHash = "admin123"; // Remember to use proper hashing in real apps
    });
  };

  public shared ({ caller }) func authenticate(username : Text, password : Text) : async Bool {
    Auth.login(username, password);
  };

  public shared ({ caller }) func addPoints(customerPrincipal : Principal, points : Points) : async () {
    CustomerPoints.addPoints(customerPrincipal, points);
  };

  public shared ({ caller }) func addOffer(name : Text, requiredPoints : PointsReward, rewardDescription : Text) : async OfferId {
    nextOfferId += 1; // increment AFTER usage to start from 0
    Offers.addOffer(name, requiredPoints, rewardDescription);
  };

  public shared ({ caller }) func deleteOffer(offerId : OfferId) : async () {
    Offers.deleteOffer(offerId);
  };

  public shared ({ caller }) func redeemOffer(customerPrincipal : Principal, offerId : OfferId) : async () {
    Offers.redeemOffer(customerPrincipal, offerId);
  };

  public query ({ caller }) func getAllOffers() : async [Offer] {
    offers.values().toArray();
  };
};
