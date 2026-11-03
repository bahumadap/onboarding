"""Navigation regression: separate settings and state-driven product destinations."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('YOL1_TEST_URL', 'http://127.0.0.1:4173')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.set_default_timeout(10000)
    page.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    page.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    def goto(path):
        page.goto(URL + path)
    def product_state(product, status):
        page.evaluate('''([product, status]) => {
          const state = JSON.parse(localStorage.getItem('yol1.enterprise'));
          state.products[product] = status;
          localStorage.setItem('yol1.enterprise', JSON.stringify(state));
        }''', [product, status])
        page.reload()
    goto('/signup')
    page.get_by_role('button', name='Control de demo', exact=True).click()
    page.get_by_role('button', name='Aplicar y abrir el Desk', exact=True).click()
    expect(page).to_have_url(URL + '/desk')
    nav = page.get_by_role('navigation', name='Navegación principal', exact=True)
    expect(nav.get_by_role('link', name='Usuarios y roles', exact=True)).to_have_count(0)
    expect(nav.get_by_role('link', name='FX · Cambio de divisas', exact=True)).to_have_count(0)
    expect(page.get_by_role('heading', name='Cuentas virtuales recientes')).to_have_count(0)
    expect(page.locator('.skeleton')).to_have_count(0)
    assert page.locator('#sec-movimientos').bounding_box()['y'] < page.locator('#sec-adicionales').bounding_box()['y']
    screenshots = Path('/tmp/yol1-navigation-review'); screenshots.mkdir(exist_ok=True)
    expect(page.get_by_role('button', name='Ver cuenta', exact=True).first).to_be_visible()
    page.screenshot(path=str(screenshots / 'desk-desktop.png'), full_page=True)
    # The gear opens a separate workspace. Back returns to the operational shell.
    page.get_by_role('link', name='Configuración', exact=True).click()
    expect(page).to_have_url(URL + '/org')
    settings = page.get_by_role('navigation', name='Navegación de configuración', exact=True)
    expect(settings.get_by_role('link', name='API e integraciones', exact=True)).to_be_visible()
    expect(page.get_by_role('navigation', name='Navegación principal', exact=True)).to_have_count(0)
    page.screenshot(path=str(screenshots / 'settings-desktop.png'), full_page=True)
    settings.get_by_role('link', name='Volver al Merchant Desk', exact=True).click()
    # Pending products stay out of the sidebar; active ones appear in catalog order.
    product_state('fx', 'pending_configuration')
    expect(nav.get_by_role('link', name='FX · Cambio de divisas', exact=True)).to_have_count(0)
    product_state('fx', 'active'); product_state('payouts', 'active')
    links = nav.get_by_role('link').all_text_contents()
    assert links.index('Cuentas virtuales') < links.index('FX · Cambio de divisas') < links.index('Payouts · Dispersión de fondos')
    nav.get_by_role('link', name='FX · Cambio de divisas', exact=True).click()
    expect(page).to_have_url(URL + '/desk/products/fx')
    expect(page.get_by_role('heading', name='FX · Cambio de divisas', exact=True)).to_be_visible()
    expect(nav.get_by_role('link', name='FX · Cambio de divisas', exact=True)).to_have_attribute('aria-current', 'page')
    page.get_by_role('link', name='Ver cuentas en divisas', exact=True).click()
    expect(page).to_have_url(URL + '/desk/accounts')
    product_state('fx', 'disabled')
    expect(nav.get_by_role('link', name='FX · Cambio de divisas', exact=True)).to_have_count(0)
    goto('/desk/products/fx')
    expect(page.get_by_text('Producto deshabilitado', exact=True)).to_be_visible()
    expect(page.get_by_role('link', name='Ver cuentas en divisas', exact=True)).to_have_count(0)
    goto('/desk/products/invalid')
    expect(page.get_by_text('Producto no encontrado', exact=True)).to_be_visible()
    # Direct URLs and mobile workspaces preserve the data and access to onboarding.
    for route in ['/org/setup', '/org/api', '/org/accounts', '/desk/accounts', '/desk/products/payouts']:
        goto(route); expect(page.locator('main h1')).to_be_visible()
    page.set_viewport_size({'width': 390, 'height': 844})
    goto('/desk')
    page.get_by_role('button', name='Abrir menú', exact=True).click()
    page.get_by_role('link', name='Configuración', exact=True).click()
    expect(page).to_have_url(URL + '/org')
    expect(page.locator('.console__sidebar--open')).to_have_count(0)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.wait_for_function("document.querySelector('.console__sidebar').getBoundingClientRect().right <= 0")
    page.screenshot(path=str(screenshots / 'settings-mobile.png'), full_page=True)
    page.get_by_role('button', name='Abrir menú', exact=True).click()
    page.get_by_role('link', name='Onboarding', exact=True).click()
    expect(page).to_have_url(URL + '/onboarding')
    page.get_by_role('button', name='Volver al Merchant Desk', exact=True).click()
    expect(page).to_have_url(URL + '/desk')
    expect(page.locator('.skeleton')).to_have_count(0)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    expect(page.get_by_role('button', name='Ver cuenta', exact=True).first).to_be_visible()
    page.screenshot(path=str(screenshots / 'desk-mobile.png'), full_page=True)
    assert not errors, errors
    print('PASS: separate workspaces, active product navigation, lifecycle routes, mobile and onboarding return')
    browser.close()
