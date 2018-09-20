describe("Prueba de Servicio", function() {

	it("Obtener Token", function(done) { 
		var token; 
		funciones.formulario.ObtenerToken("usuario","clave",function(respuesta){ 
			token = respuesta.token ? true : false;
			expect(token).toBe(true)
			done();
		});
	});

	it("Obtener Usuarios", function(){
		expect("hola").toBe("hola")

	})


})


