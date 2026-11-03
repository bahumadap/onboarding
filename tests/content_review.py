"""UX content regressions: accessible messages and progressive disclosure.
Run alongside vite preview: YOL1_TEST_URL=http://127.0.0.1:4173 python3 tests/content_review.py
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('YOL1_TEST_URL', 'http://127.0.0.1:4173')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.set_default_timeout(8000)
    page.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    page.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    def goto(path):
        print('PAGE', path, flush=True)
        page.goto(URL + path, wait_until='domcontentloaded')
    def click(name):
        print('ACTION', name, flush=True)
        page.get_by_role('button', name=name, exact=True).click()
    def described_message(control):
        ids = control.get_attribute('aria-describedby').split()
        return ' '.join(page.locator(f'[id="{key}"]').inner_text() for key in ids)
    def expand(summary):
        target = page.locator('summary').filter(has_text=summary)
        target.focus()
        target.press('Enter')
        expect(target.locator('..')).to_have_attribute('open', '')
    screenshots = Path('/tmp/yol1-content-review')
    screenshots.mkdir(exist_ok=True)

    goto('/signup')
    assert 'Macroproceso' not in page.locator('body').inner_text()
    expect(page.locator('details').first).not_to_have_attribute('open', '')
    expand('Etapas del proceso')
    page.locator('summary').filter(has_text='Etapas del proceso').press('Enter')
    click('Enviar código')
    email = page.locator('#email')
    expect(email).to_have_attribute('aria-invalid', 'true')
    assert 'correo válido' in described_message(email)
    page.screenshot(path=str(screenshots / 'signup-desktop.png'), full_page=True)
    click('Control de demo'); click('Aplicar y abrir el Desk')
    expect(page).to_have_url(URL + '/desk')
    expect(page.get_by_role('heading', name='Resumen operativo', exact=True)).to_be_visible()
    expect(page.locator('.skeleton')).to_have_count(0)
    page.screenshot(path=str(screenshots / 'desk-desktop.png'), full_page=True)

    goto('/desk/products')
    # Every product keeps the same details pattern; expand the first using a keyboard.
    first = page.locator('summary').filter(has_text='Requisitos y características').first
    first.focus(); first.press('Enter')
    expect(first.locator('..')).to_have_attribute('open', '')
    click_buttons = page.get_by_role('button', name='Solicitar producto', exact=True)
    click_buttons.first.click()
    dialog = page.get_by_role('dialog')
    expect(dialog.get_by_text('Solicitar no activa el producto: primero debe aprobarse la evaluación.', exact=True)).to_be_visible()
    expect(dialog.get_by_text('Requisitos', exact=True)).to_be_visible()
    click('Cancelar')

    goto('/org/users')
    expand('Permisos por rol')
    expect(page.get_by_text('Administrador', exact=True).last).to_be_visible()
    goto('/onboarding')
    expect(page.get_by_role('heading', name='Verificaciones aprobadas', exact=True)).to_be_visible()
    expect(page.get_by_text('Tu cuenta ya está habilitada. Puedes consultar el expediente o volver a Merchant Desk.', exact=True)).to_be_visible()
    goto('/onboarding/business')
    click('Control de demo'); click('Borrador'); click('Listo')
    # Completed sections are folded; choose the legal section and trigger its validation.
    page.get_by_role('button', name='Identificación legal', exact=False).click()
    page.locator('#kyb-taxId').fill('')
    click('Guardar sección')
    expect(page.locator('#kyb-taxId')).to_have_attribute('aria-invalid', 'true')
    assert 'identificación tributaria' in described_message(page.locator('#kyb-taxId'))
    page.screenshot(path=str(screenshots / 'kyb-error-desktop.png'), full_page=True)

    # Financial restrictions must stay visible without expanding secondary guidance.
    page.evaluate("const s=JSON.parse(localStorage.getItem('yol1.enterprise')); s.accountStatus='restricted'; localStorage.setItem('yol1.enterprise',JSON.stringify(s))")
    goto('/desk/accounts/acc_clp')
    expect(page.get_by_text('Restringida', exact=True)).to_be_visible()
    goto('/activation')
    expect(page.get_by_text('Puedes recibir abonos y consultar movimientos. Los egresos están bloqueados.', exact=True)).to_be_visible()
    for width in [390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 1000})
        goto('/onboarding')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Onboarding overflows at {width}px'
    page.set_viewport_size({'width': 390, 'height': 844})
    goto('/org/preferences')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(screenshots / 'preferences-mobile.png'), full_page=True)
    assert not errors, errors
    print('PASS: keyboard disclosure, accessible error descriptions, visible product conditions and account restrictions, responsive content')
    browser.close()
