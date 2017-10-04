1. To create a field, click "Генерировать";
2. To run an automatic game, click "Старт";
	Press again, if yoy want stop;
3. To run in manual mode, click "По 1 итерации";

var grid_number - changes size of the playing field;

var rabbit_count - changes number "rabbit" in start generation;
var wolf_count - changes number "wolf" in start generation;
var wall_count - changes number "wall" in start generation;
var grass_count - changes number "grass" in start generation;

The actions are performed in the order:
1. Grass are grawing;
2. Wolves are seeking for a rabbits;
3. If Wolf did not found rabbit, he are moving;
4. If Wolf has enough energy for duplication, he will skip steps 2 and 3;
	Insted of this he is duplicationing, if able;
5. Rabbits are seeking for a grass;
6. If Rabbit did not found grass, he are moving;
7. If Rabbit has enough energy for duplication, he will skip steps 5 and 6;
	Insted of this he is duplicationing, if able;

Other condition:
1. When animals are moving, they lost 1 energy;
2. When animals are eating, they gain energy as many as has source;
3. If animal block (all around tiles filled), he is losing 1 energy;