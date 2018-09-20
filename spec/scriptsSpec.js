describe("Prueba de Servicio", function() {

	beforeEach(function(){
		//Limpiando el localstorage antes de comenzar el test
		localStorage.clear();
		console.clear();
	})

	it("Obtener Token", function(done) { 
		var token;
		funciones.formulario.ObtenerToken("usuario","clave",function(respuesta){ 
			token = respuesta.token;
			hasToken = token ? true : false;
			expect(hasToken).toBe(true)
			done();
		});
	});

	it("Obtener Usuarios", function(done){
		var paginas, hasUsuarios, users;
		funciones.obtenerUsuarios.cantidadPaginas()
        .then(function(respuesta) {
            funciones.obtenerUsuarios.almacenarPaginas(respuesta)
            setTimeout(function(){
            	users = JSON.parse(localStorage.getItem("usuarios"));
            	hasUsuarios = users.length === respuesta ? true : false;
	        	expect(hasUsuarios).toBe(true)
				done();
            }, 2000)
    	})
	});
})


