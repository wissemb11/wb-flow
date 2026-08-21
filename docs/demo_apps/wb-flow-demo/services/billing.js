// Stub billing logic
module.exports = {
  createCustomer: async (email) => {
    return { id: 'cus_stub_123', email };
  },
  createSubscription: async (customerId, planId) => {
    return { id: 'sub_stub_456', status: 'active', customerId };
  }
};
