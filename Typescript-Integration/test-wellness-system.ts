/**
 * Test Script for Wellness Recommendation System
 * 
 * Run with: node --loader ts-node/esm Typescript-Integration/test-wellness-system.ts
 * Or: npm run test:wellness
 */

import { 
  classifySituation, 
  getRecommendations 
} from './recommender';
import { 
  createWellnessRequest,
  getPendingWellnessRequests,
  getCurrentBudgetStatus,
  approveWellnessRequest
} from './supabaseClient';
import type { Profile } from './types';

// Test profile: 19M who broke up with girlfriend
const testProfile: Profile = {
  userId: 'test-emp-001',
  name: 'Carlos Test',
  age: 19,
  gender: 'masculino',
  hobbies: ['deportes', 'musica', 'videojuegos'],
  goals: ['amigos', 'salud', 'crecimiento_personal']
};

// Test transcript: Employee expressing distress about breakup
const testTranscript = `
Hola, necesito hablar con alguien. 
Terminé con mi novia hace una semana y desde entonces no he podido concentrarme en nada.
Siento que he arruinado mis días productivos. 
Antes salíamos con amigos los fines de semana, jugábamos basketball, 
pero ahora no tengo ganas de hacer nada y me quedo encerrado en casa.
Me siento muy solo y no sé cómo volver a ser productivo.
`;

async function testWellnessSystem() {
  console.log('\n🧪 Testing BeHuman Wellness Recommendation System\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Classify situation
    console.log('\n📋 Step 1: Classifying situation from transcript...');
    const situation = classifySituation(testTranscript);
    console.log('✅ Situation detected:', {
      type: situation.type,
      subtype: situation.subtype,
      confidence: situation.confidence,
      context: situation.context
    });

    // Step 2: Get recommendations
    console.log('\n🎯 Step 2: Getting wellness recommendations...');
    const anonymousToken = `test_anon_${Date.now()}`;
    
    const recommendations = await getRecommendations(
      testProfile,
      situation,
      testTranscript,
      4, // top 4 recommendations
      anonymousToken,
      true // save to database
    );

    console.log('✅ Recommendations generated:');
    console.log('   Top recommendation:', recommendations.recommendations[0]?.product.nombre);
    console.log('   Price:', recommendations.recommendations[0]?.product.precio_desde);
    console.log('   Score:', recommendations.recommendations[0]?.score);
    console.log('   Reasons:', recommendations.recommendations[0]?.reasons.slice(0, 2));
    console.log('\n   Empathic message:', recommendations.empathicMessage.substring(0, 100) + '...');

    // Step 3: Check wellness request was saved
    console.log('\n💾 Step 3: Checking if wellness request was saved...');
    const pendingRequests = await getPendingWellnessRequests();
    const ourRequest = pendingRequests.find(r => r.anonymous_token === anonymousToken);
    
    if (ourRequest) {
      console.log('✅ Wellness request saved to database:');
      console.log('   ID:', ourRequest.id);
      console.log('   Status:', ourRequest.status);
      console.log('   Product:', ourRequest.recommended_product_name);
      console.log('   Price:', ourRequest.recommended_product_price);
    } else {
      console.log('❌ Wellness request not found in database');
      return;
    }

    // Step 4: Check budget
    console.log('\n💰 Step 4: Checking current budget...');
    const budget = await getCurrentBudgetStatus();
    
    if (budget) {
      console.log('✅ Budget status:');
      console.log('   Total:', budget.total_budget);
      console.log('   Allocated:', budget.allocated_budget);
      console.log('   Available:', budget.total_budget - budget.allocated_budget);
    } else {
      console.log('⚠️  No budget configured for current period');
    }

    // Step 5: Simulate HR approval
    console.log('\n✅ Step 5: Simulating HR approval...');
    const adminUserId = 'test-admin-001';
    
    const approvedRequest = await approveWellnessRequest(ourRequest.id, adminUserId);
    console.log('✅ Request approved:');
    console.log('   Status:', approvedRequest.status);
    console.log('   Reviewed at:', approvedRequest.reviewed_at);
    console.log('   Budget allocated:', approvedRequest.budget_allocated);

    // Step 6: Verify budget was updated
    console.log('\n💰 Step 6: Verifying budget was updated...');
    const updatedBudget = await getCurrentBudgetStatus();
    
    if (updatedBudget) {
      console.log('✅ Budget updated:');
      console.log('   Total:', updatedBudget.total_budget);
      console.log('   Allocated:', updatedBudget.allocated_budget);
      console.log('   Available:', updatedBudget.total_budget - updatedBudget.allocated_budget);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack:', error.stack);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWellnessSystem();
}

export { testWellnessSystem };
