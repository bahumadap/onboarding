"""Run against npm run dev (port 5173). Requires Python Playwright + Chromium."""
import json
import os
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('YOL1_TEST_URL', 'http://127.0.0.1:5173')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page()
    page.set_default_timeout(8000)
    page.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    page.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    def goto(path):
        page.goto(URL + path, wait_until='domcontentloaded')
    def state():
        return page.evaluate("JSON.parse(localStorage.getItem('yol1.enterprise'))")
    def code(value):
        for i, digit in enumerate(value):
            page.get_by_label(f'Dígito {i+1} de 6', exact=True).fill(digit)
    def click(name):
        print('STEP', name, flush=True)
        page.get_by_role('button', name=name, exact=True).click()
    def check_state(key, value):
        page.wait_for_function('(args) => JSON.parse(localStorage.getItem("yol1.enterprise"))[args[0]] === args[1]', arg=[key, value])
    page.clock.install()
    goto('/desk')
    expect(page).to_have_url(URL + '/signup')
    click('Control de demo')
    click('Aplicar y abrir el Desk')
    expect(page).to_have_url(URL + '/desk')
    scenario = state()
    page.get_by_role('link', name='Onboarding', exact=True).click()
    expect(page).to_have_url(URL + '/onboarding')
    click('Volver al Merchant Desk')
    expect(page).to_have_url(URL + '/desk')
    click('Control de demo')
    click('Ver onboarding')
    expect(page).to_have_url(URL + '/onboarding')
    assert state()['organization'] == scenario['organization']
    assert state()['accountStatus'] == 'active'
    click('Volver al Merchant Desk')
    page.set_viewport_size({'width': 390, 'height': 844})
    click('Abrir menú')
    page.get_by_role('link', name='Onboarding', exact=True).click()
    expect(page).to_have_url(URL + '/onboarding')
    expect(page.get_by_role('button', name='Volver al Merchant Desk', exact=True)).to_be_visible()
    click('Volver al Merchant Desk')
    page.set_viewport_size({'width': 1280, 'height': 720})
    print('PASS: return from demo Desk to onboarding via sidebar and Demo Control, desktop/mobile, preserving state')
    click('Control de demo')
    click('Reiniciar demo')
    expect(page).to_have_url(URL + '/signup')
    page.locator('#email').fill('admin@empresa.cl')
    click('Enviar código')
    expect(page.get_by_text('Verifica tu correo', exact=True)).to_be_visible()
    goto('/')
    expect(page.get_by_text('Verifica tu correo', exact=True)).to_be_visible()
    for _ in range(3):
        code('999999'); click('Verificar')
        page.wait_for_timeout(650)
    expect(page.get_by_text('Demasiados intentos', exact=True)).to_be_visible()
    page.clock.fast_forward(31000)
    click('Reenviar código')
    page.clock.fast_forward(181000)
    expect(page.get_by_text('El código expiró', exact=True)).to_be_visible()
    page.reload()
    expect(page.get_by_text('El código expiró', exact=True)).to_be_visible()
    click('Reenviar código')
    code('123456'); click('Verificar')
    page.locator('#firstName').fill('Ana')
    page.locator('#lastName').fill('Demo'); click('Continuar')
    page.locator('#tradeName').fill('Empresa Demo')
    page.locator('#industry').select_option(index=1)
    page.locator('#country').select_option('CL')
    page.locator('#operating').click()
    page.get_by_role('listbox').get_by_role('option', name='Chile', exact=True).click()
    page.locator('#operating').click()
    click('Continuar')
    page.locator('#password').fill('Empresa12345')
    page.locator('#passwordConfirm').fill('Empresa12345'); click('Continuar')
    # Reload cannot bypass the password step; credentials are never persisted.
    page.reload()
    expect(page.locator('#password')).to_be_visible()
    page.locator('#password').fill('Empresa12345')
    page.locator('#passwordConfirm').fill('Empresa12345'); click('Continuar')
    page.locator('.checkbox').click(); click('Crear mi cuenta')
    expect(page.get_by_text('Tu cuenta está creada', exact=True)).to_be_visible()
    assert 'Empresa12345' not in json.dumps(state())
    assert len(state()['team']) == 1
    click('Continuar con el onboarding')
    goto('/onboarding/business')
    page.locator('#kyb-taxId').fill('76.123.456-0')
    page.locator('#kyb-entityType').select_option(index=1)
    page.locator('#kyb-address').fill('Dirección de prueba 123')
    click('Marcar sección como completa')
    for field in ['reps', 'shareholders', 'ubos', 'ownership']:
        page.locator('#kyb-' + field).fill('Datos simulados')
    click('Marcar sección como completa')
    for label in page.locator('.ob-section__body:visible .checkbox').all():
        label.click()
    click('Marcar sección como completa')
    page.locator('#kyb-activity').fill('Servicios')
    page.locator('#kyb-volume').select_option(index=1)
    page.locator('#kyb-funds').select_option(index=1)
    page.locator('#kyb-counterparties').fill('Clientes simulados')
    click('Marcar sección como completa')
    click('Enviar a revisión')
    click('Simular aprobación')
    check_state('accountStatus', 'not_provisioned')  # identity still missing
    goto('/onboarding/identity')
    click('Iniciar validación')
    check_state('identityStatus', 'approved')
    check_state('accountStatus', 'provisioning')
    assert state()['products']['fx'] != 'active'
    goto('/desk')
    expect(page).to_have_url(URL + '/activation')
    page.reload()  # provisioning survives navigation and reload
    check_state('accountStatus', 'active')
    goto('/desk')
    assert state()['organization']['legalEntities'][0]['kybStatus'] == 'approved'
    routes = ['/desk', '/desk/accounts/acc_clp', '/desk/virtual-accounts', '/desk/transactions', '/desk/products', '/org', '/org/profile', '/org/users', '/org/accounts', '/org/approvals', '/org/api', '/org/products', '/org/compliance', '/org/preferences']
    for route in routes:
        goto(route)
        print('ROUTE', route, flush=True)
        expect(page.locator('h1')).to_be_visible()
        assert page.locator('body').inner_text().strip()
    page.get_by_role('switch', name='Novedades de productos').locator('xpath=ancestor::label').click()
    page.reload()
    expect(page.get_by_role('switch', name='Novedades de productos')).not_to_be_checked()
    goto('/desk/virtual-accounts')
    click('Crear cuenta virtual')
    page.locator('#va-alias').fill('Recaudación demo')
    click('Crear cuenta')
    expect(page.get_by_text('Recaudación demo', exact=True)).to_be_visible()
    goto('/desk/products')
    page.get_by_role('button', name='Solicitar activación', exact=True).first.click()
    click('Enviar solicitud')
    page.wait_for_timeout(250)
    assert len(state()['productRequests']) == 1
    assert 'requested' in state()['products'].values()
    assert state()['accountStatus'] == 'active'
    goto('/ruta-inexistente')
    expect(page.get_by_text('Esta página no existe', exact=True)).to_be_visible()
    page.set_viewport_size({'width': 390, 'height': 844})
    goto('/org/preferences')
    page.screenshot(path='/tmp/yol1-mobile.png', full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Mobile overflow'
    print('PASS: signup, OTP retry, password reload, KYB, identity, automatic activation, 14 routes, preferences, product request, 404, mobile')
    # Fixture states exercise guards without real compliance or bank services.
    operating = state()
    def seed(patch):
        page.evaluate('(next) => localStorage.setItem("yol1.enterprise", JSON.stringify(next))', {**operating, **patch})
    seed({'accountStatus': 'not_provisioned', 'kybStatus': 'rejected'})
    goto('/desk')
    expect(page).to_have_url(URL + '/onboarding')
    assert state()['accountStatus'] == 'not_provisioned'
    seed({'accountStatus': 'failed'})
    goto('/desk')
    expect(page).to_have_url(URL + '/activation')
    expect(page.get_by_role('button', name='Reintentar', exact=True)).to_be_visible()
    click('Reintentar')
    check_state('accountStatus', 'active')
    seed({'accountStatus': 'restricted'})
    goto('/desk')
    expect(page).to_have_url(URL + '/desk')
    assert state()['products']['payouts'] != 'active'
    print('PASS rejected, failed/retry and restricted account scenarios')
    page.evaluate("history.pushState({}, '', '/legacy'); dispatchEvent(new PopStateEvent('popstate'))")
    expect(page.locator('.legacy-root')).not_to_be_empty()
    page.evaluate("history.pushState({}, '', '/org/preferences'); dispatchEvent(new PopStateEvent('popstate'))")
    expect(page.locator('.page__head')).to_be_visible()
    assert page.locator('.page__head').evaluate('(el) => getComputedStyle(el).position') != 'sticky'
    print('PASS legacy isolated from Enterprise styles')
    assert not errors, errors
    browser.close()
