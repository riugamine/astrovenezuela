// Test de sanitización HTML - se puede eliminar después de las pruebas
import { sanitizeHtml } from './sanitize-html';

/**
 * Función para probar la sanitización HTML
 * Se puede llamar desde la consola del navegador o desde un componente
 */
export function testSanitization() {
  console.log('🧪 Probando sanitización HTML...\n');

  // Casos de prueba para XSS
  const testCases = [
    {
      name: 'Script malicioso básico',
      input: '<script>alert("XSS")</script><p>Contenido seguro</p>',
      shouldContain: '<p>Contenido seguro</p>',
      shouldNotContain: '<script>'
    },
    {
      name: 'Evento onclick',
      input: '<p onclick="alert(\'XSS\')">Texto con evento</p>',
      shouldContain: '<p>Texto con evento</p>',
      shouldNotContain: 'onclick'
    },
    {
      name: 'Iframe malicioso',
      input: '<iframe src="javascript:alert(\'XSS\')"></iframe><p>Contenido</p>',
      shouldContain: '<p>Contenido</p>',
      shouldNotContain: '<iframe>'
    },
    {
      name: 'JavaScript en href',
      input: '<a href="javascript:alert(\'XSS\')">Enlace malicioso</a>',
      shouldContain: '<a>Enlace malicioso</a>',
      shouldNotContain: 'javascript:'
    },
    {
      name: 'Contenido HTML válido',
      input: '<h2>Título</h2><p><strong>Texto en negrita</strong> y <em>cursiva</em></p><ul><li>Item 1</li><li>Item 2</li></ul>',
      shouldContain: '<h2>Título</h2>',
      shouldNotContain: ''
    },
    {
      name: 'Enlace válido',
      input: '<p>Visita <a href="https://ejemplo.com">nuestro sitio</a> para más información.</p>',
      shouldContain: 'href="https://ejemplo.com"',
      shouldNotContain: 'javascript:'
    },
    {
      name: 'Estilos permitidos',
      input: '<p style="color: #ff0000; text-align: center;">Texto rojo centrado</p>',
      shouldContain: 'color: #ff0000',
      shouldNotContain: 'background'
    }
  ];

  // Ejecutar pruebas
  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    try {
      const result = sanitizeHtml(testCase.input);
      const containsExpected = testCase.shouldContain ? result.includes(testCase.shouldContain) : true;
      const doesNotContainForbidden = testCase.shouldNotContain ? !result.includes(testCase.shouldNotContain) : true;
      
      const passed = containsExpected && doesNotContainForbidden;
      
      console.log(`Test ${index + 1}: ${testCase.name}`);
      console.log(`Input:    ${testCase.input}`);
      console.log(`Result:   ${result}`);
      console.log(`Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
      
      if (passed) passedTests++;
      
    } catch (error) {
      console.log(`Test ${index + 1}: ${testCase.name}`);
      console.log(`Input:    ${testCase.input}`);
      console.log(`Error:    ${(error as Error).message}`);
      console.log(`Status:   ❌ ERROR`);
    }
    
    console.log('---');
  });

  // Prueba de tamaño máximo
  console.log('\n🔍 Probando límite de tamaño...');
  try {
    const largeContent = '<p>' + 'a'.repeat(60000) + '</p>'; // ~60KB
    sanitizeHtml(largeContent);
    console.log('❌ FAIL: Debería haber fallado por tamaño excesivo');
  } catch (error) {
    console.log('✅ PASS: Correctamente rechazó contenido demasiado grande');
    console.log(`Error: ${(error as Error).message}`);
  }

  console.log(`\n📊 Resumen: ${passedTests}/${totalTests} tests pasaron`);

  if (passedTests === totalTests) {
    console.log('🎉 ¡Todas las pruebas de seguridad pasaron!');
    return true;
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisar la implementación.');
    return false;
  }
}

// Función para probar casos específicos
export function testSpecificCase(input: string) {
  try {
    const result = sanitizeHtml(input);
    console.log(`Input:  ${input}`);
    console.log(`Output: ${result}`);
    return result;
  } catch (error) {
    console.log(`Input:  ${input}`);
    console.log(`Error:  ${(error as Error).message}`);
    return null;
  }
}
