import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderNumber: String,
  clientUserId: String,
  assignDate: String,
  month: String,
  orderStatus: String,
  deliveryDate: String,
  teamName: String
}, { strict: false });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema, 'orders');

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Fetch all orders for EleSquad
    const orders = await Order.find({ teamName: /EleSquad/i }).lean();
    console.log(`Total EleSquad orders: ${orders.length}`);
    
    // Filter for August 2026
    const augustOrders = orders.filter(o => {
      // Check month
      const isAug = o.month && o.month.toLowerCase() === 'august';
      // Check assignDate year
      const is2026 = o.assignDate && o.assignDate.includes('2026');
      return isAug && is2026;
    });
    
    console.log(`\nFound ${augustOrders.length} August 2026 orders in DB.`);
    console.log('Order Numbers:');
    augustOrders.forEach(o => console.log(`- ${o.orderNumber} (Status: ${o.orderStatus}, DeliDate: ${o.deliveryDate})`));
    
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkOrders();
