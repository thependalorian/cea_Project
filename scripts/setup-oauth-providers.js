/**
 * OAuth Provider Setup Script
 * Purpose: Set up OAuth providers in Supabase
 * Usage: node scripts/setup-oauth-providers.js
 */
const fetch = require('node-fetch')
const readline = require('readline')
require('dotenv').config({ path: '.env.local' })

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function setupOAuthProviders() {
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
    console.log('🔍 Getting current OAuth settings...')
    
    // Get current settings
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
    
    const currentSettings = await response.json()
    
    // Display callback URL for OAuth configuration
    console.log('\n🔗 OAuth Callback URL (for provider configuration):')
    console.log('==============================================')
    console.log(`${supabaseUrl}/auth/v1/callback`)
    console.log('\n')
    
    // Set up site URL
    const siteUrl = process.env.APP_URL || await question('Enter your site URL (e.g., https://cea.georgenekwaya.com): ')
    
    // Set up redirect URLs
    console.log('\n📝 Setting up redirect URLs...')
    const redirectUrls = [
      `${siteUrl}/api/auth/callback`,
      'http://localhost:3000/api/auth/callback'
    ]
    console.log('Redirect URLs to be configured:')
    redirectUrls.forEach(url => console.log(`- ${url}`))
    
    // Set up Google OAuth
    console.log('\n📝 Setting up Google OAuth...')
    const googleClientId = await question('Enter your Google OAuth Client ID: ')
    const googleClientSecret = await question('Enter your Google OAuth Client Secret: ')
    
    // Set up LinkedIn OAuth
    console.log('\n📝 Setting up LinkedIn OAuth...')
    const linkedinClientId = await question('Enter your LinkedIn OAuth Client ID: ')
    const linkedinClientSecret = await question('Enter your LinkedIn OAuth Client Secret: ')
    
    // Prepare update payload
    const updatedSettings = {
      ...currentSettings,
      site_url: siteUrl,
      redirect_urls: redirectUrls,
      external: {
        ...currentSettings.external,
        google: {
          enabled: !!googleClientId && !!googleClientSecret,
          client_id: googleClientId,
          secret: googleClientSecret,
          redirect_uri: `${supabaseUrl}/auth/v1/callback`
        },
        linkedin: {
          enabled: !!linkedinClientId && !!linkedinClientSecret,
          client_id: linkedinClientId,
          secret: linkedinClientSecret,
          redirect_uri: `${supabaseUrl}/auth/v1/callback`
        }
      }
    }
    
    // Update settings
    console.log('\n🔄 Updating OAuth settings...')
    const updateResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(updatedSettings)
    })
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      throw new Error(`Failed to update settings. Status: ${updateResponse.status}, Error: ${errorText}`)
    }
    
    console.log('✅ OAuth providers successfully configured!')
    console.log('\n🧪 To test your configuration, visit:')
    console.log(`- Local: http://localhost:3000/auth/oauth-test`)
    console.log(`- Production: ${siteUrl}/auth/oauth-test`)
    
  } catch (err) {
    console.error('❌ Error setting up OAuth providers:', err.message)
  } finally {
    rl.close()
  }
}

setupOAuthProviders() 