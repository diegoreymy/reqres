var funciones = {
	inicio: function() {
		usuarios = [];
		funciones.sesion.checkLogin();
		var url = window.location.href;
		if(url.indexOf("login") > -1){
			$("#email").on("change", funciones.formulario.validarEmail);
			$("#password").on("change", funciones.formulario.validarPassword);
			$("#btn-enviar").on("click", funciones.formulario.validarTodo);
		}else if (url.indexOf("index") > -1){
			funciones.obtenerUsuarios.porPagina(1, funciones.obtenerUsuarios.listar);
			funciones.obtenerUsuarios.buscar();
			funciones.obtenerUsuarios.ordenar();
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
		porId : function(id, callback){
			opcions = {
				"method" : "GET",
				"async" : true,
				"url" : "https://reqres.in/api/users/"+id
			}
			$.ajax(opcions)
			.done(callback)
			.fail(function(){
				console.log("Error en el servicio al consultar el usuario");
			})
		},
		obtenerTodos : function(respuesta){
			respuesta.data.map(function(usuario){
				usuarios.push(usuario);
			})
			localStorage.setItem("usuarios", JSON.stringify(usuarios)); 
		},
		listarTodos : function(totalPaginas){
			for (var i = 1 ; i <= totalPaginas; i++) {
				funciones.obtenerUsuarios.porPagina(i, funciones.obtenerUsuarios.obtenerTodos)
			}
		},
		listar : function(respuesta){
			var pagina = respuesta.page;
			var totalPaginas = respuesta.total_pages;
			var htmlPaginacion = "";
			var flechaNext = '<li class="next"><a href="javascript:;" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
			var flechaPrev = '<li class="prev"><a href="javascript:;" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
			for (var i = 1 ; i <= totalPaginas; i++) {
				i != pagina 
					? 
					htmlPaginacion += '<li data-id="'+i+'"><a href="javascript:;">'+i+'</a></li>' 
					:  
					htmlPaginacion += '<li data-id="'+i+'" class="active"><a href="javascript:;">'+i+'</a></li>'
				;
			}
			$("#paginacionLista .pagination").append(flechaPrev,htmlPaginacion,flechaNext);		   	
			respuesta.data.map(function(usuario){
				var elemUsuario = 	'<tr id="'+usuario.id+'">' +
									'<td class="id">' + usuario.id + '</td>' +
									'<td class="nombre">' + usuario.first_name + '</td>' +
									'<td class="apellido">' + usuario.last_name + '</td>' +
									'<td class="detalles"> <button type="button" class="btnDetalles btn btn-warning glyphicon glyphicon-eye-open" data-toggle="modal" data-target="#modalDetalles"></button> </td>' +
									'</tr>';
				$("#lista tbody").append(elemUsuario);
			})
			funciones.obtenerUsuarios.paginacion(pagina, totalPaginas);

			$(".btnDetalles").on("click", function(){
				$("#modalDetalles .modal-body .detalles").remove();
				var id = $(this).closest("tr").attr('id'); 
				funciones.obtenerUsuarios.porId(id,funciones.obtenerUsuarios.detalles)
			})
		},
		paginacion : function(pagina, totalPaginas){
			var elemRemove = "#paginacionLista .pagination li[data-id], #paginacionLista .pagination li.next, #paginacionLista .pagination li.prev, #lista tbody tr";
			$("#paginacionLista li[data-id]").on("click", function(){
				var pagina = $(this).attr("data-id");
				$(elemRemove).remove();
				funciones.obtenerUsuarios.porPagina(pagina, funciones.obtenerUsuarios.listar);
			});
			pagina == 1 
			? $(".pagination li.prev").addClass("disabled").click(function(e) { e.preventDefault() })
			: $(".pagination li.prev").removeClass("disabled").unbind('click')
			pagina == totalPaginas 
			? $(".pagination li.next").addClass("disabled").click(function(e) { e.preventDefault() })
			: $(".pagination li.next").removeClass("disabled").unbind('click')

			$(".pagination li.next:not(.disabled)").on("click", function(){
				$(elemRemove).remove();
				funciones.obtenerUsuarios.porPagina(pagina+1, funciones.obtenerUsuarios.listar);
			});
			$(".pagination li.prev:not(.disabled)").on("click", function(){
				$(elemRemove).remove();
				funciones.obtenerUsuarios.porPagina(pagina-1, funciones.obtenerUsuarios.listar);
			});

		},
		detalles : function(respuesta){
			var usuario = respuesta.data;
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
		buscar : function(){
			$("#inputBuscar").on("keyup", function(){
				var texto = $(this).val().toLowerCase();
				$("#lista tbody tr").filter(function(){
					$(this).toggle(($(this).text().toLowerCase().indexOf(texto) > -1));
				})
			})
		},
		ordenar : function(){

			$("#lista tr.info th").not(':last').on("click", function(){
				var columna = this;
				$("#lista tr.info th").each(function(posicion, valor){
					columna == valor ? columna = posicion : false ;	
				})
				var elementos = [];
				$("#lista tbody tr td:nth-child("+(columna+1)+")").each(function(){ 
					elementos.push($(this).text()) 
				})
				elementos.sort();
				function orden(elemento){
					$("#lista tbody tr").each(function(){
						$(this).text().indexOf(elemento) > -1 ? $("#lista tbody").append(this) : false;
					})
				}
				elementos.filter(orden)
			})
		}
	}
}


