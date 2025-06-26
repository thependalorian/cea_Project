/**
 * OAuth Provider Check Script
 * Purpose: Check the status of OAuth providers in Supabase
 * Usage: node scripts/check-oauth-providers.js
 */
const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

async function checkOAuthProviders() {
  // Get Supabase project details
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or service role key in .env.local')
    process.exit(1)
  }
  
  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  
  if (!projectRef) {
    console.error('❌ Could not extract project reference from Supabase URL')
    process.exit(1)
  }
  
  try {
    console.log('🔍 Checking OAuth providers...')
    
    // Check if OAuth providers are enabled
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Extract provider information
    const providers = data?.external || {}
    
    console.log('\n📊 OAuth Provider Status:')
    console.log('=======================')
    
    // Check each provider
    const providerNames = ['google', 'linkedin', 'github', 'facebook', 'twitter', 'apple']
    
    for (const name of providerNames) {
      const provider = providers[name]
      const status = provider?.enabled ? '✅ ENABLED' : '❌ DISABLED'
      console.log(`${name.padEnd(10)}: ${status}`)
      
      if (provider?.enabled) {
        console.log(`           Client ID: ${maskString(provider.client_id || '')}`)
        console.log(`           Secret: ${maskString(provider.secret || '')}`)
        if (provider.redirect_uri) {
          console.log(`           Redirect URI: ${provider.redirect_uri}`)
        }
      }
    }
    
    // Check redirect URLs
    console.log('\n🔄 Redirect URLs:')
    console.log('==============')
    
    const redirectUrls = data?.redirect_urls || []
    if (redirectUrls.length === 0) {
      console.log('❌ No redirect URLs configured')
    } else {
      redirectUrls.forEach(url => console.log(`- ${url}`))
    }
    
    // Check site URL
    console.log('\n🌐 Site URL:')
    console.log('=========')
    console.log(data?.site_url || '❌ No site URL configured')
    
    // Display callback URL for OAuth configuration
    console.log('\n🔗 OAuth Callback URL (for provider configuration):')
    console.log('==============================================')
    console.log(`${supabaseUrl}/auth/v1/callback`)
    
    console.log('\n')
  } catch (err) {
    console.error('❌ Error checking OAuth providers:', err.message)
    process.exit(1)
  }
}

// Helper function to mask sensitive strings
function maskString(str) {
  if (!str) return ''
  if (str.length <= 8) return '********'
  return str.substring(0, 4) + '****' + str.substring(str.length - 4)
}

checkOAuthProviders() 