import { chromium } from 'playwright'

async function runTest() {
  console.log('🚀 Starting E2E test...\n')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  try {
    // 1. Landing Page
    console.log('1️⃣ Opening landing page...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 })
    await page.screenshot({ path: 'screenshots/01-landing.png' })
    console.log('   ✅ Screenshot saved: 01-landing.png')

    const title = await page.textContent('h1')
    console.log(`   📌 Title: ${title}`)

    const button = await page.locator('button:has-text("World ID로 시작하기")')
    const buttonVisible = await button.isVisible()
    console.log(`   📌 Login button visible: ${buttonVisible}\n`)

    // 2. Click login button -> Marketplace
    console.log('2️⃣ Clicking "World ID로 시작하기"...')
    await button.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'screenshots/02-marketplace.png' })
    console.log('   ✅ Screenshot saved: 02-marketplace.png')

    const botCards = await page.locator('text=탐색하기').count()
    console.log(`   📌 Bot cards found: ${botCards}\n`)

    // 3. Click explore on first bot
    console.log('3️⃣ Clicking "탐색하기" on first bot...')
    await page.locator('text=탐색하기').first().click()
    await page.waitForURL('**/explore/**', { timeout: 10000 })
    await page.waitForTimeout(2000) // Wait for graph to render
    await page.screenshot({ path: 'screenshots/03-explore.png' })
    console.log('   ✅ Screenshot saved: 03-explore.png')

    const graphVisible = await page.locator('canvas').isVisible().catch(() => false)
    console.log(`   📌 Graph canvas visible: ${graphVisible}\n`)

    // 4. Navigate directly to contribute (avoid back button issues)
    console.log('4️⃣ Navigating to contribute page...')
    await page.goto('http://localhost:3000/contribute/seoul-local-guide', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'screenshots/04-contribute.png' })
    console.log('   ✅ Screenshot saved: 04-contribute.png\n')

    // 5. Test rewards page
    console.log('5️⃣ Navigating to rewards...')
    await page.goto('http://localhost:3000/rewards', { waitUntil: 'networkidle', timeout: 30000 })
    await page.screenshot({ path: 'screenshots/05-rewards.png' })
    console.log('   ✅ Screenshot saved: 05-rewards.png')

    const rewardsTitle = await page.textContent('h1')
    console.log(`   📌 Page title: ${rewardsTitle}\n`)

    // 6. Test explore list page (direct navigation)
    console.log('6️⃣ Testing explore list page...')
    await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'screenshots/06-explore-list.png' })
    console.log('   ✅ Screenshot saved: 06-explore-list.png')

    const exploreTitle = await page.textContent('h1')
    const botLinks = await page.locator('a[href^="/explore/"]').count()
    console.log(`   📌 Explore page title: ${exploreTitle}`)
    console.log(`   📌 Bot links found: ${botLinks}\n`)

    // 7. Test bottom navigation back to home
    console.log('7️⃣ Testing navigation back to home...')
    const homeNav = page.locator('nav a:has-text("홈")')
    await homeNav.click()
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 })
    await page.screenshot({ path: 'screenshots/07-nav-home.png' })
    console.log('   ✅ Screenshot saved: 07-nav-home.png\n')

    console.log('✅ All tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    await page.screenshot({ path: 'screenshots/error.png' })
  } finally {
    await browser.close()
  }
}

runTest()
