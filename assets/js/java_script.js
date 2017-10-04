//Ссылка на спрайт
var atlas = new Image();
atlas.src = 'assets/img/art.png'

window.onload = function() {
	var map = document.createElement('canvas'); //Основной холст
	var ctxMap = map.getContext("2d");
	var grid_number = 7; //Число клеток поля
	map.width = grid_number*100;
	map.height = grid_number*100;
	var body = document.getElementById('body');
	body.appendChild(map).id = "map";

	//Создание пустой сетки поля
	var grid_array = new Array(grid_number);
	for(var i = 0; i < grid_array.length; i++){
		grid_array[i] = new Array(grid_number);
	}

	//Параметры травоядного животного
	var rabbit = {
		grass_down: false,
		grass_grow: true,
		type: "o",
		eat: false,
		move: false,
		duplication: false,
		energy: 10,
		energy_duplication: 20
	};
	//Параметры хищного животного
	var wolf = {
		grass_down: false,
		grass_grow: true,
		type: "@",
		eat: false,
		move: false,
		duplication: false,
		energy: 50,
		energy_duplication: 250
	};
	//Параметры травы
	var grass = {
		grass_down: true,
		grass_grow: false,
		type: "*",
		eat: false,
		move: false,
		duplication: false,
		energy: 0,
		energy_duplication: 0
	};
	//Параметры стены
	var wall = {
		grass_down: false,
		grass_grow: false,
		type: "#",
		eat: false,
		move: false,
		duplication: false,
		energy: 0,
		energy_duplication: 0
	};
	//Параметры пустой клетки
	var empty = {
		grass_down: false,
		grass_grow: true,
		type: " ",
		eat: false,
		move: false,
		duplication: false,
		energy: 0,
		energy_duplication: 0
	};
	
	var Entity = function(entity) {
		var self = {};
		self.grass_down = entity.grass_down; //Наличие травы на клетке
		self.grass_grow = entity.grass_grow; //Возможность размещения травы на клетке
		self.grass_new = false; //Статус "новая трава" для ограниче каскада роста
		self.type = entity.type; //Тип сущности в клетке
		self.eat = entity.eat; //Ела ли сущность
		self.move = entity.move; //Двигалась ли сущность
		self.duplication = entity.duplication //Размножалась ли сущность
		self.energy = entity.energy; //Текущее хначение энергии сущности
		self.energy_duplication = entity.energy_duplication //Значение при котором сущность размножится

		//Отрисовка сущности на холсте
		self.draw = function (x,y){
			//Отрисовка не прозрачной пустой клетки под всеми слоями
			ctxMap.drawImage(atlas, 200, 0, 100, 100, x*100, y*100, 100, 100);
			//Отрисовка травы
			if (self.grass_down == true && self.type != "#") {
				ctxMap.drawImage(atlas, 400, 0, 100, 100, x*100, y*100, 100, 100);
			}
			if (self.type == "#") {
				ctxMap.drawImage(atlas, 300, 0, 100, 100, x*100, y*100, 100, 100);
			}
			//Отрисовка волка
			if (self.type == "@") {
				ctxMap.drawImage(atlas, 100, 0, 100, 100, x*100, y*100, 100, 100);
				ctxMap.fillStyle  = "#00F";
				ctxMap.font = "bold 14px Arial";
				ctxMap.fillText(self.energy + "hp", x*100+58, y*100+93);
			}
			//Отрисовка зайца
			if (self.type == "o") {
				ctxMap.drawImage(atlas, 0, 0, 100, 100, x*100, y*100, 100, 100);
				ctxMap.fillStyle  = "#F00";
				ctxMap.font = "bold 14px Arial";
				ctxMap.fillText(self.energy + "hp", x*100+33, y*100+13);
			}
		}
		//Изменение атрибутов при движении сущности
		self.moving = function (entity){
			entity.type = self.type;
			entity.move = true;
			entity.energy = self.energy-1;
			entity.energy_duplication = self.energy_duplication;
		}
		//Создание и отрисовка пустой сущности
		self.re_draw = function (i,j){
			if(self.grass_down == true) {
				self = new Entity(grass);
				self.draw(i,j);
				return self;
			} else {
				self = new Entity(empty);
				self.draw(i,j);
				return self;
			}
		}
		//Проверка жизнеспособности сущности, с последующим созданием пустой сущности
		self.dying = function (){
			if (self.energy <= 0) {
				if(self.grass_down == true) {
					self = new Entity(grass);
					return self;
				} else {
					self = new Entity(empty);
					return self;
				}
			}
			return self;
		}
		//Создание сущности в случае размножения
		self.duplicating = function (type, grass){
			self = new Entity(type);
			self.duplication = true;
			self.grass_down = grass;
			return self;
		}
		return self;
	};

	//Изначальная генерация поля
	function generate_map () {
		//Заполнение поля пустыми полями
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				grid_array[i][j] = new Entity(empty);
				grid_array[i][j].draw(i,j);
			}
		}

		var rabbit_count = 2; //Число зайцев на поле по умлочанию
		var wolf_count = 1; //Число волков на поле по умлочанию
		var wall_count = 10; //Число стен на поле по умлочанию
		var grass_count = 4; //Число травы на поле по умлочанию

		//Расстановка сущностей случайным образом
		function generate_entity(type, count) {
			var i = Math.floor(Math.random()*(grid_number)); //Генерация случайной координаты по оХ
			var j = Math.floor(Math.random()*(grid_number)); //Генерация случайно координации по oY
			//Проверка на занятость клетки
			if (grid_array[i][j].type != " " && grid_array[i][j].type != "*") {
				generate_entity(type, count); // Генерация новой пары значений в случае если клетка уже занята
			} else if (count > 0) {
				count--; // Уменьшаем счетчик оставшихся сущностей для размещения
				grid_array[i][j] = new Entity(type);
				grid_array[i][j].draw(i,j);
				generate_entity(type, count);
			}
		}

		generate_entity(rabbit, rabbit_count); //Генерация зайцев
		generate_entity(wolf, wolf_count); //Генерация волков
		generate_entity(wall, wall_count); //Генерация стен
		generate_entity(grass, grass_count); //Генерация травы
	}
	
	//Кнопка генерации игрового поля
	var push_settings = document.getElementById('push_settings');
	push_settings.onclick = function () {
		generate_map ();
	}

	//Кнопка запуска цикла
	var starting = document.getElementById('starting'); 
	//Статус активности цикла
	var isPlay = false;
	//Идентефикатор интервала
	var interval_id;
	//Обработчик события для кнопки запуска цикла
	starting.onclick = function () {
		if (isPlay == false) {
			interval_id = setInterval(start, 500);
			isPlay = true;
		} else if (isPlay == true) {
			clearInterval(interval_id);
			isPlay = false;
		}	
	}

	//Кнопка пошагового запуска
	var step = document.getElementById('step'); 
	step.onclick = function () {
		clearInterval(interval_id);
		isPlay = false;
		start ();
	}

	//Функция запуска цикла
	function start () {
		//Обработка события роста травы
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				if (grid_array[i][j].grass_down == true && grid_array[i][j].grass_new != true) {
					//Рост травы вниз прямо
					if (grid_array[i][j+1] != undefined && grid_array[i][j+1].grass_grow == true && grid_array[i][j+1].grass_down == false) { 
						grid_array[i][j+1].grass_down = true; //Отмечаем флаг того что на клетке есть трава
						grid_array[i][j+1].grass_new = true; //Отмечаем флаг того что трава не должна расти
						grid_array[i][j+1].draw(i,j+1); //Перерисовывем клетку
					} 
					//Рост травы вправо-прямо
					else if (i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].grass_grow == true && grid_array[i+1][j].grass_down == false) { 
						grid_array[i+1][j].grass_down = true;
						grid_array[i+1][j].grass_new = true;
						grid_array[i+1][j].draw(i+1,j);
					} 
					//Рост травы вверх-прямо
					else if (grid_array[i][j-1] != undefined && grid_array[i][j-1].grass_grow == true && grid_array[i][j-1].grass_down == false) { 
						grid_array[i][j-1].grass_down = true;
						grid_array[i][j-1].grass_new = true;
						grid_array[i][j-1].draw(i,j-1);
					} 
					//Рост травы влево-прямо
					else if (i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].grass_grow == true && grid_array[i-1][j].grass_down == false) { 
						grid_array[i-1][j].grass_down = true;
						grid_array[i-1][j].grass_new = true;
						grid_array[i-1][j].draw(i-1,j);
					} 
					//Рост травы влево-вверх
					else if (i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].grass_grow == true && grid_array[i-1][j-1].grass_down == false) { 
						grid_array[i-1][j-1].grass_down = true;
						grid_array[i-1][j-1].grass_new = true;
						grid_array[i-1][j-1].draw(i-1,j-1);
					} 
					//Рост травы вправо-вверх
					else if (i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].grass_grow == true && grid_array[i+1][j-1].grass_down == false) { 
						grid_array[i+1][j-1].grass_down = true;
						grid_array[i+1][j-1].grass_new = true;
						grid_array[i+1][j-1].draw(i+1,j-1);
					} 
					//Рост травы влево-вниз
					else if (i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].grass_grow == true && grid_array[i-1][j+1].grass_down == false) { 
						grid_array[i-1][j+1].grass_down = true;
						grid_array[i-1][j+1].grass_new = true;
						grid_array[i-1][j+1].draw(i-1,j+1);
					} 
					//Рост травы вправо-вниз
					else if (i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].grass_grow == true && grid_array[i+1][j+1].grass_down == false) { 
						grid_array[i+1][j+1].grass_down = true;
						grid_array[i+1][j+1].grass_new = true;
						grid_array[i+1][j+1].draw(i+1,j+1);
					}
				}
			}
		}

		//Обработка атаки хищников
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				if(grid_array[i][j].type == "@" && grid_array[i][j].energy < grid_array[i][j].energy_duplication) {
					//Поиск жертвы вниз-прямо
					if (grid_array[i][j+1] != undefined && grid_array[i][j+1].type == "o") {
						grid_array[i][j].energy += grid_array[i][j+1].energy; // Добавление к енергии хищника, енергии жертвы
						grid_array[i][j].eat = true; // Отмечаем флаг, что волк совершил действие
						grid_array[i][j+1] = grid_array[i][j+1].re_draw(i,j+1); // Перерисовываем поле с жертвой
						grid_array[i][j].draw(i,j); // Перерисовываем поле волка
					} 
					//Поиск жертвы вправо-прямо
					else if (i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == "o") { 
						grid_array[i][j].energy += grid_array[i+1][j].energy;
						grid_array[i][j].eat = true;
						grid_array[i+1][j] = grid_array[i+1][j].re_draw(i+1,j);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск жертвы вверх-прямо
					else if (grid_array[i][j-1] != undefined && grid_array[i][j-1].type == "o") { 
						grid_array[i][j].energy += grid_array[i][j-1].energy;
						grid_array[i][j].eat = true;
						grid_array[i][j-1] = grid_array[i][j-1].re_draw(i,j-1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск жертвы влево-прямо
					else if (i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == "o") { 
						grid_array[i][j].energy += grid_array[i-1][j].energy;
						grid_array[i][j].eat = true;
						grid_array[i-1][j] = grid_array[i-1][j].re_draw(i-1,j);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск жертвы влево-вверх
					else if (i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == "o") { 
						grid_array[i][j].energy += grid_array[i-1][j-1].energy;
						grid_array[i][j].eat = true;
						grid_array[i-1][j-1] = grid_array[i-1][j-1].re_draw(i-1,j-1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск жертвы вправо-вверх
					else if (i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == "o") { 
						grid_array[i][j].energy += grid_array[i+1][j-1].energy;
						grid_array[i][j].eat = true;
						grid_array[i+1][j-1] = grid_array[i+1][j-1].re_draw(i+1,j-1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск жертвы влево-вниз
					else if (i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == "o") { 
						grid_array[i][j].energy += grid_array[i-1][j+1].energy;
						grid_array[i][j].eat = true;
						grid_array[i-1][j+1] = grid_array[i-1][j+1].re_draw(i-1,j+1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск жертвы вправо-вниз
					else if (i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == "o") { 
						grid_array[i][j].energy += grid_array[i+1][j+1].energy;
						grid_array[i][j].eat = true;
						grid_array[i+1][j+1] = grid_array[i+1][j+1].re_draw(i+1,j+1);
						grid_array[i][j].draw(i,j);
					}
				}
			}
		}

		//Обработка движения хищников
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				if(grid_array[i][j].type == "@" && grid_array[i][j].eat != true && grid_array[i][j].move != true && grid_array[i][j].energy < grid_array[i][j].energy_duplication) {
					var direction_array = []; //Массив допустимого направления движения (каждое значение от 1-8 характеризует возможное направление движения)
					//Поиск движения вниз прямо
					if (grid_array[i][j+1] != undefined && grid_array[i][j+1].type == " " || grid_array[i][j+1] != undefined && grid_array[i][j+1].type == "*") {
						direction_array.push("1");
					} 
					//Поиск движения вправо-прямо
					if (i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == " " || i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == "*") { 
						direction_array.push("2");
					} 
					//Поиск движения вверх-прямо
					if (grid_array[i][j-1] != undefined && grid_array[i][j-1].type == " " || grid_array[i][j-1] != undefined && grid_array[i][j-1].type == "*") { 
						direction_array.push("3");
					} 
					//Поиск движения влево-прямо
					if (i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == " " || i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == "*") { 
						direction_array.push("4");
					} 
					//Поиск движения влево-вверх
					if (i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == " " || i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == "*") { 
						direction_array.push("5");
					} 
					//Поиск движения вправо-вверх
					if (i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == " " || i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == "*") { 
						direction_array.push("6");
					} 
					//Поиск движения влево-вниз
					if (i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == " " || i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == "*") { 
						direction_array.push("7");
					} 
					//Поиск движения вправо-вниз
					if (i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == " " || i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == "*") { 
						direction_array.push("8");
					}

					var number = Math.floor(Math.random()*(direction_array.length)); //Генератор случайного значения, от возможного числа направлений движения
					//Совершение движения на основании случайного выбора
					switch (direction_array[number]) {
						case "1":
							grid_array[i][j].moving(grid_array[i][j+1]); //Копируем поля волка в новую клетку
							grid_array[i][j+1] = grid_array[i][j+1].dying(); //Проверяем не умер ил волк после движения
							grid_array[i][j+1].draw(i,j+1); //Пересовывем поле куда идет волк
							grid_array[i][j] = grid_array[i][j].re_draw(i,j); //Перерисовываем поле откуда ушел волк
							break;
						case "2": 
							grid_array[i][j].moving(grid_array[i+1][j]);
							grid_array[i+1][j] = grid_array[i+1][j].dying();
							grid_array[i+1][j].draw(i+1,j);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "3": 
							grid_array[i][j].moving(grid_array[i][j-1]);
							grid_array[i][j-1] = grid_array[i][j-1].dying();
							grid_array[i][j-1].draw(i,j-1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "4": 
							grid_array[i][j].moving(grid_array[i-1][j]);
							grid_array[i-1][j] = grid_array[i-1][j].dying();
							grid_array[i-1][j].draw(i-1,j);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "5": 
							grid_array[i][j].moving(grid_array[i-1][j-1]);
							grid_array[i-1][j-1] = grid_array[i-1][j-1].dying();
							grid_array[i-1][j-1].draw(i-1,j-1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "6": 
							grid_array[i][j].moving(grid_array[i+1][j-1]);
							grid_array[i+1][j-1] = grid_array[i+1][j-1].dying();
							grid_array[i+1][j-1].draw(i+1,j-1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "7": 
							grid_array[i][j].moving(grid_array[i-1][j+1]);
							grid_array[i-1][j+1] = grid_array[i-1][j+1].dying();
							grid_array[i-1][j+1].draw(i-1,j+1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "8": 
							grid_array[i][j].moving(grid_array[i+1][j+1]);
							grid_array[i+1][j+1] = grid_array[i+1][j+1].dying();
							grid_array[i+1][j+1].draw(i+1,j+1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
					}
				}
			}
		}

		//Размножение хищников
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				if(grid_array[i][j].type == "@" && grid_array[i][j].move != true && grid_array[i][j].eat != true && grid_array[i][j].energy >= grid_array[i][j].energy_duplication) {
					var duplication_array = []; //Массив допустимого направления размножения (каждое значение от 1-8 характеризует возможное направление размножения)
					//Поиск свободной клетки вниз-прямо
					if (grid_array[i][j+1] != undefined && grid_array[i][j+1].type == " " || grid_array[i][j+1] != undefined && grid_array[i][j+1].type == "*") {
						duplication_array.push("1");
					} 
					//Поиск свободной клетки вправо-прямо
					if (i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == " " || i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == "*") { 
						duplication_array.push("2");
					} 
					//Поиск свободной клетки вверх-прямо
					if (grid_array[i][j-1] != undefined && grid_array[i][j-1].type == " " || grid_array[i][j-1] != undefined && grid_array[i][j-1].type == "*") { 
						duplication_array.push("3");
					} 
					//Поиск свободной клетки влево-прямо
					if (i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == " " || i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == "*") { 
						duplication_array.push("4");
					} 
					//Поиск свободной клетки влево-вверх
					if (i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == " " || i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == "*") { 
						duplication_array.push("5");
					} 
					//Поиск свободной клетки вправо-вверх
					if (i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == " " || i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == "*") { 
						duplication_array.push("6");
					} 
					//Поиск свободной клетки влево-вниз
					if (i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == " " || i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == "*") { 
						duplication_array.push("7");
					} 
					//Поиск свободной клетки вправо-вниз
					if (i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == " " || i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == "*") { 
						duplication_array.push("8");
					}

					var number = Math.floor(Math.random()*(duplication_array.length));//Генератор случайного значения, от возможного числа направлений размножения
					//Совершение размножения на основании случайного выбора
					switch (duplication_array[number]) {
						case "1":
							grid_array[i][j+1] = grid_array[i][j+1].duplicating(wolf,grid_array[i][j+1].grass_down); //Создания экзмепляра новой сущности в новой клетке
							grid_array[i][j].duplication = true; //Отмечаем флаг что существо выполнило действие
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2); //Делим энергию родителя пополам
							grid_array[i][j+1].energy = grid_array[i][j].energy; //Назначаем половину энергии потомку
							grid_array[i][j+1].draw(i,j+1); //Перерисовываем поле где родился новый волк
							grid_array[i][j].draw(i,j); //Перерисовываем поле где стоит родитель
							break;
						case "2": 
							grid_array[i+1][j] = grid_array[i+1][j].duplicating(wolf,grid_array[i+1][j].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i+1][j].energy = grid_array[i][j].energy;
							grid_array[i+1][j].draw(i+1,j);
							grid_array[i][j].draw(i,j);
							break;
						case "3": 
							grid_array[i][j-1] = grid_array[i][j-1].duplicating(wolf,grid_array[i][j-1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i][j-1].energy = grid_array[i][j].energy;
							grid_array[i][j-1].draw(i,j-1);
							grid_array[i][j].draw(i,j);
							break;
						case "4": 
							grid_array[i-1][j] = grid_array[i-1][j].duplicating(wolf,grid_array[i-1][j].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i-1][j].energy = grid_array[i][j].energy;
							grid_array[i-1][j].draw(i-1,j);
							grid_array[i][j].draw(i,j);
							break;
						case "5": 
							grid_array[i-1][j-1] = grid_array[i-1][j-1].duplicating(wolf,grid_array[i-1][j-1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i-1][j-1].energy = grid_array[i][j].energy;
							grid_array[i-1][j-1].draw(i-1,j-1);
							grid_array[i][j].draw(i,j);
							break;
						case "6": 
							grid_array[i+1][j-1] = grid_array[i+1][j-1].duplicating(wolf,grid_array[i+1][j-1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i+1][j-1].energy = grid_array[i][j].energy;
							grid_array[i+1][j-1].draw(i+1,j-1);
							grid_array[i][j].draw(i,j);
							break;
						case "7": 
							grid_array[i-1][j+1] = grid_array[i-1][j+1].duplicating(wolf,grid_array[i-1][j+1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i-1][j+1].energy = grid_array[i][j].energy;
							grid_array[i-1][j+1].draw(i-1,j+1);
							grid_array[i][j].draw(i,j);
							break;
						case "8": 
							grid_array[i+1][j+1] = grid_array[i+1][j+1].duplicating(wolf,grid_array[i+1][j+1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i+1][j+1].energy = grid_array[i][j].energy;
							grid_array[i+1][j+1].draw(i+1,j+1);
							grid_array[i][j].draw(i,j);
							break;
					}
				}
			}
		}

		//Обработка поиска пищи травоядными
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				if(grid_array[i][j].type == "o" && grid_array[i][j].energy < grid_array[i][j].energy_duplication) {
					//Поиск травы под собой
					if (grid_array[i][j].grass_down == true) {
						grid_array[i][j].energy += 5; // Начисление фиксированой энергии за поедание травы
						grid_array[i][j].eat = true; // Отмечаем флаг что заяц совершил действие
						grid_array[i][j].grass_down = false; //Убираем флаг что в клетке есть трава
						grid_array[i][j].draw(i,j); //Перерисовываем поле
					} 
					//Поиск травы вниз-прямо
					else if (grid_array[i][j+1] != undefined && grid_array[i][j+1].grass_down == true && grid_array[i][j+1].type != "o" && grid_array[i][j+1].type != "@") {
						grid_array[i][j].energy += 5;
						grid_array[i][j].eat = true;
						grid_array[i][j+1].grass_down = false;
						grid_array[i][j+1] = grid_array[i][j+1].re_draw(i,j+1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск травы вправо-прямо
					else if (i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].grass_down == true && grid_array[i+1][j].type != "o" && grid_array[i+1][j].type != "@") { 
						grid_array[i][j].energy += 5;
						grid_array[i][j].eat = true;
						grid_array[i+1][j].grass_down = false;
						grid_array[i+1][j] = grid_array[i+1][j].re_draw(i+1,j);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск травы вверх-прямо
					else if (grid_array[i][j-1] != undefined && grid_array[i][j-1].grass_down == true && grid_array[i][j-1].type != "o" && grid_array[i][j-1].type != "@") { 
						grid_array[i][j].energy += 5;
						grid_array[i][j].eat = true;
						grid_array[i][j-1].grass_down = false;
						grid_array[i][j-1] = grid_array[i][j-1].re_draw(i,j-1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск травы влево-прямо
					else if (i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].grass_down == true && grid_array[i-1][j].type != "o" && grid_array[i-1][j].type != "@") { 
						grid_array[i][j].energy += 5;
						grid_array[i][j].eat = true;
						grid_array[i-1][j].grass_down = false;
						grid_array[i-1][j] = grid_array[i-1][j].re_draw(i-1,j);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск травы влево-вверх
					else if (i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].grass_down == true && grid_array[i-1][j-1].type != "o" && grid_array[i-1][j-1].type != "@") { 
						grid_array[i][j].energy += 5;
						grid_array[i][j].eat = true;
						grid_array[i-1][j-1].grass_down = false;
						grid_array[i-1][j-1] = grid_array[i-1][j-1].re_draw(i-1,j-1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск травы вправо-вверх
					else if (i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].grass_down == true && grid_array[i+1][j-1].type != "o" && grid_array[i+1][j-1].type != "@") { 
						grid_array[i][j].energy += 5;
						grid_array[i][j].eat = true;
						grid_array[i+1][j-1].grass_down = false;
						grid_array[i+1][j-1] = grid_array[i+1][j-1].re_draw(i+1,j-1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск травы влево-вниз
					else if (i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].grass_down == true && grid_array[i-1][j+1].type != "o" && grid_array[i-1][j+1].type != "@") { 
						grid_array[i][j].energy += 5;
						grid_array[i][j].eat = true;
						grid_array[i-1][j+1].grass_down = false;
						grid_array[i-1][j+1] = grid_array[i-1][j+1].re_draw(i-1,j+1);
						grid_array[i][j].draw(i,j);
					} 
					//Поиск травы вправо-вниз
					else if (i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].grass_down == true && grid_array[i+1][j+1].type != "o" && grid_array[i+1][j+1].type != "@") { 
						grid_array[i][j].energy += 5;
						grid_array[i][j].eat = true;
						grid_array[i+1][j+1].grass_down = false;
						grid_array[i+1][j+1] = grid_array[i+1][j+1].re_draw(i+1,j+1);
						grid_array[i][j].draw(i,j);
					}
				}
			}
		}

		//Обработка движения травоядного
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				if(grid_array[i][j].type == "o" && grid_array[i][j].eat != true && grid_array[i][j].move != true && grid_array[i][j].energy < grid_array[i][j].energy_duplication) {
					var direction_array = []; //Массив допустимого направления движения (каждое значение от 1-8 характеризует возможное направление движения)
					//Поиск движения вниз-прямо
					if (grid_array[i][j+1] != undefined && grid_array[i][j+1].type == " " || grid_array[i][j+1] != undefined && grid_array[i][j+1].type == "*") {
						direction_array.push("1");
					} 
					//Поиск движения вправо-прямо
					if (i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == " " || i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == "*") { 
						direction_array.push("2");
					} 
					//Поиск движения вверх-прямо
					if (grid_array[i][j-1] != undefined && grid_array[i][j-1].type == " " || grid_array[i][j-1] != undefined && grid_array[i][j-1].type == "*") { 
						direction_array.push("3");
					} 
					//Поиск движения влево-прямо
					if (i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == " " || i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == "*") { 
						direction_array.push("4");
					} 
					//Поиск движения влево-вверх
					if (i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == " " || i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == "*") { 
						direction_array.push("5");
					} 
					//Поиск движения вправо-вверх
					if (i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == " " || i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == "*") { 
						direction_array.push("6");
					} 
					//Поиск движения влево-вниз
					if (i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == " " || i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == "*") { 
						direction_array.push("7");
					} 
					//Поиск движения вправо-вниз
					if (i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == " " || i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == "*") { 
						direction_array.push("8");
					}

					var number = Math.floor(Math.random()*(direction_array.length)); // Генератор случайного значения, от возможного числа направлений движения
					// Совершение движения на основании случайного выбора
					switch (direction_array[number]) {
						case "1":
							grid_array[i][j].moving(grid_array[i][j+1]); // Копируем поля зайца в новую клетку
							grid_array[i][j+1] = grid_array[i][j+1].dying(); // Проверям не умер ли заяц после движения
							grid_array[i][j+1].draw(i,j+1); // Перерисовываем поле куда идет заяц
							grid_array[i][j] = grid_array[i][j].re_draw(i,j); // Перерисовываем поле от куда ушел заяц
							break;
						case "2": 
							grid_array[i][j].moving(grid_array[i+1][j]);
							grid_array[i+1][j] = grid_array[i+1][j].dying();
							grid_array[i+1][j].draw(i+1,j);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "3": 
							grid_array[i][j].moving(grid_array[i][j-1]);
							grid_array[i][j-1] = grid_array[i][j-1].dying();
							grid_array[i][j-1].draw(i,j-1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "4": 
							grid_array[i][j].moving(grid_array[i-1][j]);
							grid_array[i-1][j] = grid_array[i-1][j].dying();
							grid_array[i-1][j].draw(i-1,j);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "5": 
							grid_array[i][j].moving(grid_array[i-1][j-1]);
							grid_array[i-1][j-1] = grid_array[i-1][j-1].dying();
							grid_array[i-1][j-1].draw(i-1,j-1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "6": 
							grid_array[i][j].moving(grid_array[i+1][j-1]);
							grid_array[i+1][j-1] = grid_array[i+1][j-1].dying();
							grid_array[i+1][j-1].draw(i+1,j-1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "7": 
							grid_array[i][j].moving(grid_array[i-1][j+1]);
							grid_array[i-1][j+1] = grid_array[i-1][j+1].dying();
							grid_array[i-1][j+1].draw(i-1,j+1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
						case "8": 
							grid_array[i][j].moving(grid_array[i+1][j+1]);
							grid_array[i+1][j+1] = grid_array[i+1][j+1].dying();
							grid_array[i+1][j+1].draw(i+1,j+1);
							grid_array[i][j] = grid_array[i][j].re_draw(i,j);
							break;
					}
				}
			}
		}

		//Обработка размножения травоядного
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				if(grid_array[i][j].type == "o" && grid_array[i][j].move != true && grid_array[i][j].eat != true && grid_array[i][j].energy >= grid_array[i][j].energy_duplication) {
					var duplication_array = []; //Массив допустимого направления размножения (каждое значение от 1-8 характеризует возможное направление размножения)
					//Поиск свободной клетки вниз-прямо
					if (grid_array[i][j+1] != undefined && grid_array[i][j+1].type == " " || grid_array[i][j+1] != undefined && grid_array[i][j+1].type == "*") {
						duplication_array.push("1");
					} 
					//Поиск свободной клетки вправо-прямо
					if (i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == " " || i<grid_number-1 && grid_array[i+1][j] != undefined && grid_array[i+1][j].type == "*") { 
						duplication_array.push("2");
					} 
					//Поиск свободной клетки вверх-прямо
					if (grid_array[i][j-1] != undefined && grid_array[i][j-1].type == " " || grid_array[i][j-1] != undefined && grid_array[i][j-1].type == "*") { 
						duplication_array.push("3");
					} 
					//Поиск свободной клетки влево-прямо
					if (i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == " " || i>0 && grid_array[i-1][j] != undefined && grid_array[i-1][j].type == "*") { 
						duplication_array.push("4");
					} 
					//Поиск свободной клетки влево-вверх
					if (i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == " " || i>0 && grid_array[i-1][j-1] != undefined && grid_array[i-1][j-1].type == "*") { 
						duplication_array.push("5");
					} 
					//Поиск свободной клетки вправо-вверх
					if (i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == " " || i<grid_number-1 && grid_array[i+1][j-1] != undefined && grid_array[i+1][j-1].type == "*") { 
						duplication_array.push("6");
					} 
					//Поиск свободной клетки влево-вниз
					if (i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == " " || i>0 && grid_array[i-1][j+1] != undefined && grid_array[i-1][j+1].type == "*") { 
						duplication_array.push("7");
					} 
					//Поиск свободной клетки вправо-вниз
					if (i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == " " || i<grid_number-1 && grid_array[i+1][j+1] != undefined && grid_array[i+1][j+1].type == "*") { 
						duplication_array.push("8");
					}

					var number = Math.floor(Math.random()*(duplication_array.length));//Генератор случайного значения, от возможного числа направлений размножения
					//Совершение размножения на основании случайного выбора
					switch (duplication_array[number]) {
						case "1":
							grid_array[i][j+1] = grid_array[i][j+1].duplicating(rabbit,grid_array[i][j+1].grass_down); // Создание новой сущности зайца в соседней клетке
							grid_array[i][j].duplication = true; // Отмечаем флаг действия
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2); // Делим энергию родителя пополам
							grid_array[i][j+1].energy = grid_array[i][j].energy; // Передаем половину энергии потомку
							grid_array[i][j+1].draw(i,j+1); // Перерисовываем поле потомка
							grid_array[i][j].draw(i,j); // Перерисовываем поле родителя
							break;
						case "2": 
							grid_array[i+1][j] = grid_array[i+1][j].duplicating(rabbit,grid_array[i+1][j].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i+1][j].energy = grid_array[i][j].energy;
							grid_array[i+1][j].draw(i+1,j);
							grid_array[i][j].draw(i,j);
							break;
						case "3": 
							grid_array[i][j-1] = grid_array[i][j-1].duplicating(rabbit,grid_array[i][j-1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i][j-1].energy = grid_array[i][j].energy;
							grid_array[i][j-1].draw(i,j-1);
							grid_array[i][j].draw(i,j);
							break;
						case "4": 
							grid_array[i-1][j] = grid_array[i-1][j].duplicating(rabbit,grid_array[i-1][j].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i-1][j].energy = grid_array[i][j].energy;
							grid_array[i-1][j].draw(i-1,j);
							grid_array[i][j].draw(i,j);
							break;
						case "5": 
							grid_array[i-1][j-1] = grid_array[i-1][j-1].duplicating(rabbit,grid_array[i-1][j-1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i-1][j-1].energy = grid_array[i][j].energy;
							grid_array[i-1][j-1].draw(i-1,j-1);
							grid_array[i][j].draw(i,j);
							break;
						case "6":
							grid_array[i+1][j-1] = grid_array[i+1][j-1].duplicating(rabbit,grid_array[i+1][j-1].grass_down); 
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i+1][j-1].energy = grid_array[i][j].energy;
							grid_array[i+1][j-1].draw(i+1,j-1);
							grid_array[i][j].draw(i,j);
							break;
						case "7": 
							grid_array[i-1][j+1] = grid_array[i-1][j+1].duplicating(rabbit,grid_array[i-1][j+1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i-1][j+1].energy = grid_array[i][j].energy;
							grid_array[i-1][j+1].draw(i-1,j+1);
							grid_array[i][j].draw(i,j);
							break;
						case "8": 
							grid_array[i+1][j+1] = grid_array[i+1][j+1].duplicating(rabbit,grid_array[i+1][j+1].grass_down);
							grid_array[i][j].duplication = true;
							grid_array[i][j].energy = Math.floor(grid_array[i][j].energy/2);
							grid_array[i+1][j+1].energy = grid_array[i][j].energy;
							grid_array[i+1][j+1].draw(i+1,j+1);
							grid_array[i][j].draw(i,j);
							break;
					}
				}
			}
		}

		//Обработка пропуска хода
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				if (grid_array[i][j].move == false && grid_array[i][j].eat == false && grid_array[i][j].duplication == false && grid_array[i][j].type == "o" || grid_array[i][j].move == false && grid_array[i][j].eat == false && grid_array[i][j].duplication == false && grid_array[i][j].type == "@") {
					grid_array[i][j].energy -= 1; // Отнимаем энергию 
					grid_array[i][j] = grid_array[i][j].dying(); // Проверка не умерла ли сущность
					grid_array[i][j].draw(i,j); // Перерисовываем клетку
				}
			}
		}
		//Обнуление статусов: "новая трава", "сущность питалась", "сущность двигалась", "сущность размножалась"
		for(var i = 0; i < grid_array.length; i++){
			for(var j = 0; j < grid_array.length; j++){
				//Обнуление всех флагов действия
				grid_array[i][j].grass_new = false;
				grid_array[i][j].move = false;
				grid_array[i][j].eat = false;
				grid_array[i][j].duplication = false;
			}
		}
	}
}