// Mock for convex/_generated/api
module.exports = {
  api: {
    users: {
      getCurrentUserRole: 'users:getCurrentUserRole',
      syncUser: 'users:syncUser',
      updateUser: 'users:updateUser',
      getUserRole: 'users:getUserRole',
      getAllUsers: 'users:getAllUsers',
    },
    memberships: {
      getMembershipPlans: 'memberships:getMembershipPlans',
      getUserMembership: 'memberships:getUserMembership',
      getMembershipBySubscription: 'memberships:getMembershipBySubscription',
      upsertMembership: 'memberships:upsertMembership',
    },
  },
};
