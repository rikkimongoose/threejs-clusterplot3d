threejs-clusterplot3d
=====================
Трёхмерный график для кластерного анализа на JavaScript. Основан на библиотеке [ThreeJS](http://threejs.org/) для WebGL.

## Настройки

### Опции данных
* **title** — Название элемента данных. По умолчанию *null*.
* **x** — Индекс в исходных данных для значений по оси X. По умолчанию *0*.
* **y** — Индекс в исходных данных для значений по оси Y. По умолчанию *0*.
* **z** — Индекс в исходных данных для значений по оси Z. По умолчанию *0*.
* **color** — По умолчанию *0xff0000*.
* **outlineColor** — Цвет гало. По умолчанию *null*.
* **outlineExpand** — Коэффициент размера гало по сравнению с самим объектом. По умолчанию *1.2*. Выполняется только в том случае, если установлен **outlineColor**.
* **material** — Материал элементов. Выполняется, если **itemViewMode** установлено в *THREEx.CONST_ITEMS_MODE.GEOMETRY*. По умолчанию *THREEx.PLOT_TYPE.MATERIAL.LAMBER*. Доступные значения:
  - *THREEx.PLOT_TYPE.MATERIAL.BASIC*
  - *THREEx.PLOT_TYPE.MATERIAL.LAMBER*
  - *THREEx.PLOT_TYPE.MATERIAL.PHONG*
* **size** — Размер элементов. По умолчанию *1*.
* **type** — Форма элемента. Выполняется, если **itemViewMode** установлено в *THREEx.CONST_ITEMS_MODE.GEOMETRY*. По умолчанию *THREEx.PLOT_TYPE.ITEM.CUBE*. Доступные значения:
  - *THREEx.PLOT_TYPE.MATERIAL.SPHERE*
  - *THREEx.PLOT_TYPE.MATERIAL.CUBE*
  - *THREEx.PLOT_TYPE.MATERIAL.BAR*

### Опции графика

#### Фон

* **showSkybox** — Отображать фон. Без него отображается чёрный фон (по умолчанию). Это несколько ускоряет загрузку, но вызывает проблемы с перерисовкой в Internet Explorer. По умолчанию *true*.
* **colorBackgroundBox** — Цвет фона. По умолчанию *0xffffff*.
* **colorLight** — Цвет освещения. По умолчанию *0xffffff*.

#### Источник света

* **lightX** — Позиция источника света по оси X. По умолчанию *400*.
* **lightY** — Позиция источника света по оси Y. По умолчанию *300*.
* **lightZ** — Позиция источника света по оси Z. По умолчанию *400*.

#### Стенки

* **colorXZ** — Цвет стенки между X и Z. По умолчанию *0x006600*.
* **colorXZCentral** — Цвет центральных линий между X и Z. По умолчанию *0x00ff00*.
* **сolorXY** — Цвет стенки между X и Z. По умолчанию *0x000066*.
* **colorXYCentral** — Цвет центральных линий между X и Z. По умолчанию *0x0000ff*.
* **сolorYZ** — Цвет стенки между X и Z. По умолчанию *0x660000*.
* **colorYZCentral** — Цвет центральных линий между X и Z. По умолчанию *0xff0000*.
* **stepsSize** — Размер стенки. По умолчанию *100*.
* **stepsCount** — Количество делений на стенке. По умолчанию *20*.

#### Данные

* **stratch** — Растягивать набор элементов вдоль координатной оси. По умолчанию *true*.
* **showGrids** — Показывать стенки графика. По умолчанию *true*.

#### Камера

* **cameraX** — Позиция камеры по оси X. По умолчанию *400*.
* **cameraY** — Позиция камеры по оси Y. По умолчанию *300*.
* **cameraZ** — Позиция камеры по оси Z. По умолчанию *400*.
* **cameraAngle** — Угол камеры (в градусах). По умолчанию *45*.

#### Цвет и отрисовка
* **palette** — Палитра отображения. По умолчанию *THREEx.COLOR_PALETTE_TYPE.HSL*. Доступные варианты:
  - *THREEx.COLOR_PALETTE_TYPE.HSL* — все возможные цвета от красного до фиолетового
  - *THREEx.COLOR_PALETTE_TYPE.SEMAPHORE* — Красный-Жёлтый-Зелёный и промежутки между ними
  - *THREEx.COLOR_PALETTE_TYPE.ICE* — тёплые оттенки
  - *THREEx.COLOR_PALETTE_TYPE.HOT* — холодные оттенки

* **highlightSelected** — Подсвечивать выделенный элемент. По умолчанию *true*. В режиме *THREEx.CONST_ITEMS_MODE.PARTICLE* подсветка не работает.
* **selectedItemColor** — Цвет подсветки выделенного элемента. По умолчанию *0xffffff*.
* **itemViewMode** — Режим отрисовки элементов. По умолчанию *THREEx.CONST_ITEMS_MODE.GEOMETRY*. Доступные варианты:
  - *THREEx.CONST_ITEMS_MODE.GEOMETRY* — стандартное рисование. Доступны различные виды материалов, поддерживается выделение элемента.
  - *THREEx.CONST_ITEMS_MODE.PARTICLE* — рисование в режиме "частичек". Значительно быстрее, не поддерживается смена материала и выделение элемента.

#### Подписи осей

* **showAxisLabels** — Показывать подписи осей. По умолчанию *true*.
* **axisLabelX** — Подпись оси X | *x* |
* **axisLabelY** — Подпись оси Y | *y*|
* **axisLabelZ** — Подпись оси Z | *z* |

##### Шрифты подписи осей

* **axisLabelFont** — Шрифт подписи осей. По умолчанию *THREEx.FONT.helvetiker*. Доступные шрифты:
  - *THREEx.CONST_ITEMS_MODE.gentilis*
  - *THREEx.CONST_ITEMS_MODE.helvetiker*
  - *THREEx.CONST_ITEMS_MODE.optimer*
  - *THREEx.CONST_ITEMS_MODE.droid_sans*
  - *THREEx.CONST_ITEMS_MODE.droid_serif*
* **axisLabelCurveSegments** — Количество сегментов в подписе осей. По умолчанию *0*.
* **axisLabelFrontColor** — Центральный цвет в подписи осей. По умолчанию *0xffffff*.
* **axisLabelSideColor** — Боковой цвет в подписи осей. По умолчанию *0x000000*.
* **axisLabelSize** — Размер подписи осей. По умолчанию *18*.
* **axisLabelHeight** — Настрочная высота. По умолчанию *4*.
* **axisLabelBevelEnabled** — Использовать окантовку. По умолчанию *true*.
* **axisLabelBevelSize** — Размер окантовки. По умолчанию *2*.
* **axisLabelBevelThickness** — Толщина окантовки. По умолчанию *1*.