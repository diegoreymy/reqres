var funciones = {
	inicio: function() {
		funciones.sesion.checkLogin();
		var url = window.location.href;
		if(url.indexOf("login") > -1){
			$("#email").on("change", funciones.formulario.validarEmail);
			$("#password").on("change", funciones.formulario.validarPassword);
			$("#btn-enviar").on("click", funciones.formulario.validarTodo);
		}else if (url.indexOf("index") > -1){
			funciones.obtenerUsuarios.cantidadPaginas(funciones.obtenerUsuarios.almacenarPaginas);
			setTimeout(function(){funciones.obtenerUsuarios.listar()},1000)
			funciones.obtenerUsuarios.buscar();
			$("#logout").on("click", funciones.sesion.cerrarSesion);
		}
	},
	formulario: {
		ObtenerToken: function(email, clave, callback){
			var datos = {
				email: email,
				password: clave
			};
			var opciones = {
				"async" : true,
				"url" : "https://reqres.in/api/login",
				"method" : "POST",
				"data" : datos
			}
			$.ajax(opciones)
			.done(callback)
			.fail(function(){
				console.log("error en el servicio")
			})
		},
		login: function(respuesta) {
			var fecha = new Date();
			fecha.setMinutes((fecha.getMinutes()) + 20);
			localStorage.setItem('token', respuesta.token);
			localStorage.setItem('expiracionToken', fecha);
			window.location = "index.html"
		},
		submit:	function(){
			var email = $("#formulario-login #email").val();
			var password = $("#formulario-login #password").val();
			this.ObtenerToken(email, password, this.login);
		},
		validarEmail : function(){
			$("#email").closest(".form-group").removeClass("has-error has-success").find("span").remove();
			var email = $("#formulario-login #email").val();
            var regexEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            var error = '<span class="glyphicon glyphicon-remove form-control-feedback"></span><span class="help-block">Eso no es un email</span>'
            var correcto = '<span class="glyphicon glyphicon-ok form-control-feedback"></span>'
            var validar = regexEmail.test(email) == false 
            ? $("#email").closest(".form-group").append(error).addClass('has-error')
            : $("#email").closest(".form-group").append(correcto).addClass('has-success')
		},
		validarPassword : function(){
			$("#password").closest(".form-group").removeClass("has-error has-success").find("span").remove();
			var password = $("#formulario-login #password").val();
            var error = '<span class="glyphicon glyphicon-remove form-control-feedback"></span><span class="help-block">Campo Obligatorio</span>'
            var correcto = '<span class="glyphicon glyphicon-ok form-control-feedback"></span>'
            var validar = password === "" 
            ? $("#password").closest(".form-group").append(error).addClass('has-error')
            : $("#password").closest(".form-group").append(correcto).addClass('has-success')
		},
		validarTodo : function(){
			funciones.formulario.validarEmail();
			funciones.formulario.validarPassword();
			$("#formulario-login .has-error").length === 0 && funciones.formulario.submit();
		},
	},
	sesion: {
		loginExpirado : function(){
			var token = localStorage.getItem('token');
			var expiracionToken = new Date(localStorage.getItem('expiracionToken'));
			var horaActual = new Date();
			var expirado = horaActual > expiracionToken ? true : false ; 
			return expirado;
		},
		checkLogin : function(){
			funciones.sesion.loginExpirado() == true && window.location.href.indexOf("login") === -1 
			? funciones.sesion.cerrarSesion() 
			: console.log("");
		},
		cerrarSesion : function(){
			localStorage.removeItem('token');
			localStorage.removeItem('expiracionToken');
			localStorage.removeItem('usuarios');
			window.location = "login.html";
		}
	},
	obtenerUsuarios: {
		cantidadPaginas : function (callback){
			opciones = {
				"method": "GET",
				"async": true,
				"url" : "https://reqres.in/api/users"
			}
			$.ajax(opciones)
			.done(function(respuesta){
				callback(respuesta.total_pages)
			})
			.fail(function(){
				console.log("Error en el servicio al consultar los usuarios");
			})
		},
		porPagina : function (pagina, callback){
			opciones = {
				"method": "GET",
				"async": true,
				"url" : "https://reqres.in/api/users?page="+pagina
			}
			$.ajax(opciones)
			.done(callback)
			.fail(function(){
				console.log("Error en el servicio al consultar los usuarios");
			})
		},
		almacenarUsuarios : function(respuesta){
			respuesta.data.map(function(usuario){
				usuarios.push(usuario);
			})
			usuarios.sort(function(a,b){ return a.id-b.id })
			localStorage.setItem("usuarios", JSON.stringify(usuarios));
		},
		almacenarPaginas : function(totalPaginas){
			usuarios = [];
			for (var i = 1 ; i <= totalPaginas; i++) {
				funciones.obtenerUsuarios.porPagina(i, funciones.obtenerUsuarios.almacenarUsuarios)
			}
		},
		listar : function(){
			var listUsuarios = JSON.parse(localStorage.getItem("usuarios"))
			listUsuarios.map(function(usuario){
				var elemUsuario = 	'<tr id="'+usuario.id+'">' +
									'<td class="id">' + usuario.id + '</td>' +
									'<td class="nombre">' + usuario.first_name + '</td>' +
									'<td class="apellido">' + usuario.last_name + '</td>' +
									'<td class="detalles"> <button type="button" class="btnDetalles btn btn-warning glyphicon glyphicon-eye-open" data-toggle="modal" data-target="#modalDetalles"></button> </td>' +
									'</tr>';
				$("#lista tbody").append(elemUsuario);
				funciones.obtenerUsuarios.clickDetalles();
			})
		},
		buscar : function(){
			$("#inputBuscar").on("keyup", function(){
				var texto = $(this).val().toLowerCase();
				$("#lista tbody tr").filter(function(){
					$(this).toggle(($(this).text().toLowerCase().indexOf(texto) > -1));
				})
			})
		},
		obtenerDetalles : function(id){
			var listUsuarios = JSON.parse(localStorage.getItem("usuarios"))
			var usuario = listUsuarios[id];
			var detalles = '<div class="row detalles">' + 
						   '<div class="col-sm-12 col-md-12">'+
						   '<div class="thumbnail text-center">' + 
						   '<img src="'+usuario.avatar+'" alt="'+usuario.first_name +" "+usuario.last_name+'">'+
						   '<div class="caption">'+
						   '<h3>'+usuario.first_name +" "+usuario.last_name+'</h3>'+
						   '<p>ID del usuario: '+ usuario.id +'</p>'+
						   '</div></div></div></div>';

			$("#modalDetalles .modal-body").append(detalles);
		},
		clickDetalles : function(){
			$(".btnDetalles").on("click", function(){
				$("#modalDetalles .modal-body .detalles").remove();
				var id = $(this).closest("tr").attr("id")
				funciones.obtenerUsuarios.obtenerDetalles(id-1);			
			})
		}
	}
}
