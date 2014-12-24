threejs-clusterplot3d
=====================
A 3D clustering plot engine for JavaScript. Based on ThreeJS WebGL library.

## Настройки
### Опции графика
| Название  | Функция | По умолчанию |
| ----------|---------|--------------|
|**stratch**| Выравнивать размер | *true* |
|**showGrids**| Показывать стенки | *true* |
|**colorBackgroundBox**| Цвет фона | *0xffffff* |
|**colorLight**| Цвет освещения | *0xffffff* |
|**colorXZ**| Цвет стенки между X и Z | *0x006600* |
|**colorXZCentral**| Цвет центральных линий между X и Z | *0x00ff00* |
|**сolorXY**| Цвет стенки между X и Y | *0x000066* |
|**colorXYCentral**| Цвет центральных линий между X и Y | *0x0000ff* |
|**сolorYZ**| Цвет стенки между Y и Z | *0x660000* |
|**colorYZCentral**| Цвет центральных линий между Y и Z | *0xff0000* |
|**cameraX**| Позиция камеры по оси X | *400* |
|**cameraY**| Позиция камеры по оси Y | *300* |
|**cameraZ**| Позиция камеры по оси Z | *400* |
|**cameraAngle**| Угол камеры (в градусах) | *45* |
|**lightX**| Позиция источника света по оси X | *400* |
|**lightY**| Позиция источника света по оси Y | *300* |
|**lightZ**| Позиция источника света по оси Z | *400* |
|**stepsSize**| Размер стенки | *100* |
|**stepsCount**| Количество делений на стенке | *20* |
|**palette**| Палитра отображения | *THREEx.COLOR_PALETTE_TYPE.HSL* |
|**showSkybox**| Показывать фон. Без него начинаются проблемы с перерисовкой в IE | *true* |
|**highlightSelected**| Подсвечивать выделенный элемент. | *true* |
|**selectedItemColor**| Цвет выделения | *0xffffff* |
|**itemViewMode**| Режим отрисовки элементов | *THREEx.CONST_ITEMS_MODE.GEOMETRY* |
|**showAxisLabels**| Показывать подписи осей | *true* |
|**axisLabelX**| Подпись оси X | *x* |
|**axisLabelY**| Подпись оси Y | *y*|
|**axisLabelZ**| Подпись оси Z | *z* |
|**axisLabelFont**| Шрифт подписи осей | *THREEx.FONT.helvetiker* |
|**axisLabelCurveSegments**| Количество сегментов в подписе осей | *0* |
|**axisLabelFrontColor**| Центральный цвет в подписи осей | *0xffffff* |
|**axisLabelSideColor**| Боковой цвет в подписи осей | *0x000000* |
|**axisLabelSize**| Размер подписи осей | *18* |
|**axisLabelHeight**| Настрочная высота | *4* |
|**axisLabelBevelEnabled**| Использовать окантовку | *true* |
|**axisLabelBevelSize**| Размер окантовки | *2* |
|**axisLabelBevelThickness**| Толщина окантовки | *1* |