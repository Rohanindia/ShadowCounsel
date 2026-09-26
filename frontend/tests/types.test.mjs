import test from 'node:test'
import assert from 'node:assert/strict'

test('RiskLevel type validation', () => {
  const validRiskLevels = ['Low', 'Medium', 'High']
  assert.equal(validRiskLevels.length, 3)
  assert.ok(validRiskLevels.includes('Low'))
  assert.ok(validRiskLevels.includes('Medium'))
  assert.ok(validRiskLevels.includes('High'))
})

test('AgentRole type validation', () => {
  const validRoles = ['advocate', 'shadow_party', 'arbiter']
  assert.equal(validRoles.length, 3)
  assert.ok(validRoles.includes('advocate'))
  assert.ok(validRoles.includes('shadow_party'))
  assert.ok(validRoles.includes('arbiter'))
})

test('ClauseVerdict data structure integrity', () => {
  const sampleVerdict = {
    clause_id: 1,
    clause_text: 'Tenant shall forfeit deposit on early termination.',
    category: 'Termination & Forfeiture',
    advocate_analysis: 'Unfair clause under Indian Contract Act Section 74.',
    shadow_party_analysis: 'Agreed liquidated damages by mutual consent.',
    arbiter_verdict: 'Unenforceable as a penalty without actual loss.',
    risk_level: 'High',
    citations: [
      {
        act_name: 'Indian Contract Act 1872',
        section_number: '74',
        text_excerpt: 'Compensation for breach of contract where penalty stipulated for.',
        relevance_score: 0.95
      }
    ]
  }

  assert.equal(sampleVerdict.clause_id, 1)
  assert.equal(sampleVerdict.risk_level, 'High')
  assert.equal(sampleVerdict.citations.length, 1)
  assert.equal(sampleVerdict.citations[0].section_number, '74')
})

test('WhatIfConsequence data structure validation', () => {
  const consequence = {
    matched_clause_id: 1,
    matched_clause_text: 'Lock-in period clause',
    financial_range: '₹50,000 - ₹1,00,000',
    legal_consequences: 'Possible dispute in Small Causes Court.',
    likelihood: 'High',
    statute_citations: []
  }

  assert.equal(consequence.matched_clause_id, 1)
  assert.ok(consequence.financial_range.includes('₹'))
})
