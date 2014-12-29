threejs-clusterplot3d
=====================
Трёхмерный график для кластерного анализа на JavaScript. Основан на библиотеке [ThreeJS](http://threejs.org/) для WebGL.

## Использование

Проще всего рисовать график функцией **THREEx.doPlot3d** (аналогично функциям из jQuery):

**THREEx.doPlot3d(containerId, data, dataOptions, plotOptions, onItemLoad, onItemsLoad, onBeforeLoad, onPlotHover, onPlotHoverOut)**

Параметры:

* **containerId** — id элемента, в который следует поместить график.
* **data** — данные для графика. Массив, состоящий из массивов или объектов. 
* **dataOptions** — настройки отображения данных.
* **plotOptions** — настройки графика. *Не обязательный*.
* **onItemLoad** — функция обратного вызова. Выполняется, когда на график добавляется элемент. *Не обязательный*.
* **onItemsLoad** — функция обратного вызова. Выполняется, когда добавление элементов на график завершено. *Не обязательный*.
* **onBeforeLoad** — функция обратного вызова. Выполняется перед началом загрузки элементов. *Не обязательный*.
* **onPlotHover** — функция обратного вызова. Выполняется, когда происходит выделение элемента. *Не обязательный*.
* **onPlotHoverOut** — функция обратного вызова. Выполняется, когда с элемента убирается выделение. *Не обязательный*.

Пример использования:
```html
<style>
    canvas { width: 100%; height: 100% }
</style>
<script src="js/jquery-1.9.1.js"></script>
<script src="js/jquery-ui.js"></script>
<link rel=stylesheet href="css/jquery-ui.css" />

<div id="ThreeJS" style="z-index: 2; left:0px; top:0px; width: 100%; height:100%;"></div>
```

Добавляем библиотеки:

```html
<script src="js/three.min.js"></script>
<script src="js/THREEx.Plot3d.min.js"></script>
```

И отрисовываем:

```javascript
$(function() {
    var sourceData = [
      [0,0,0,5, "color1"],
      [10,10,10,5, "color2"],
      [20, 20, 20, 5, "color3"]
    ];
    var plot = THREEx.doPlot3d(
      "ThreeJS",
      sourceData,
      { color : 4, type_const : THREEx.PLOT_TYPE.ITEM.SPHERE },
      { x : 0, y : 1, z : 2, size : 3 }
    );
});
```

Если элементов данных достаточно много (больше нескольких сотен), то разумно использовать режим "частичек". Например, так:

```javascript
$(function() {
    var sourceData = [
        [4, 59, 1],
        [4, 50, 1],
        [1, 40, 1],
        
        //...10000 elements more...
        
        [111, 0, 0],
    ];
    
    var plot = THREEx.doPlot3d(
        "ThreeJS",
        sourceData,
        { color: 2 },
        {
            colorBackgroundBox : 0x000000,
            itemViewMode : THREEx.CONST_ITEMS_MODE.PARTICLE,
            axisLabelFrontColor : 0x000000,
            axisLabelSideColor : 0xffffff,
            axisLabelBevelSize : 1
        }
    );
});
```

## Другие функции и объекты

### THREEx.ClusterPlot3d

Основной объект библиотеки. Расширение для THREE.js, рисует 3-хмерные кластерные графики.

Функция **THREEx.doPlot3d** — обёртка над этим классом, чтобы создавать график за один вызов.

Класс поддерживает цепочки вызовов.

Пример использования:

```javascript
var data = [
    [0,0,0,5, "color1"],
    [10,10,10,5, "color2"],
    [20, 20, 20, 5, "color3"]
];
var containerId = "ThreeJS";
var plotOptions = {};
var dataOptions = { color : 4, type_const : THREEx.PLOT_TYPE.ITEM.SPHERE },

var cluster3d = new THREEx.ClusterPlot3d(plotOptions)
    .doDrawBackground(containerId)
    .doParseData(data, dataOptions)
    .doDrawData();
```

Методы класса:

* **THREEx.ClusterPlot3d(plotOptions)** — конструктор класса. В *plotOptions* указываются настройки графика.
* **doDrawBackground(elemId)** — отобразить фон и координатную сетку на DOM-элемент c id, указанном в параметре *elemId*.
* **doClear()** — очистить график
* **doParseData(data, dataOptions)** — загрузить данные для отрисовки. Данные загружаются в виде массива, который передаётся в параметре **data**. **dataOptions** задают параметры отображения.
* **doDrawData()** — отобразить данные на график

Методы обработки событий 

* **addEvent(eventTitle, func)** — добавить функцию-обработчик *func* для события *eventTitle*. Название события передаётся в строке, например: *'onItemLoad'*
* **execEvent(eventTitle, e)** — выполнить функции-обработчики для события *eventTitle*, передавая им параметр *e*.

Доступные события:

* *onItemLoad* — выполняется, когда на график добавляется элемент
* *onItemsLoaded* — выполняется, когда добавление элементов на график завершено
* *onBeforeLoad* — выполняется перед началом загрузки элементов
* *onPlotHover* — выполняется, когда происходит выделение элемента
* *onPlotHoverOut* — выполняется, когда с элемента убирается выделение

## Настройки

### Опции данных (dataOptions)

В значении указывается индекс исходного массива данных, который и определяет параметр. Если его необходимо фиксировать, параметр указывается с постфиксом **_const**. Например:

```javascript
{ color: 2, material_const : THREEx.PLOT_TYPE.MATERIAL.BASIC }
```

* **title** — Название элемента данных. По умолчанию *null*.
* **x** — Индекс в исходных данных для значений по оси X. По умолчанию *0*.
* **y** — Индекс в исходных данных для значений по оси Y. По умолчанию *1*.
* **z** — Индекс в исходных данных для значений по оси Z. По умолчанию *2*.
* **color** — Цвет элемента данных на графике. По умолчанию *0xff0000* (красный).
* **outlineColor** — Цвет гало элемента данных. По умолчанию *null*.
* **outlineExpand** — Коэффициент размера гало по сравнению с самим объектом. По умолчанию *1.2*. Выполняется только в том случае, если установлен **outlineColor**.
* **material** — Материал элементов. Выполняется, если **itemViewMode** установлено в *THREEx.CONST_ITEMS_MODE.GEOMETRY*. По умолчанию *THREEx.PLOT_TYPE.MATERIAL.LAMBER*. Доступные значения:
  - *THREEx.PLOT_TYPE.MATERIAL.BASIC*
  - *THREEx.PLOT_TYPE.MATERIAL.LAMBER*
  - *THREEx.PLOT_TYPE.MATERIAL.PHONG*
* **size** — Размер элементов. По умолчанию *3*.
* **type** — Форма элемента. Выполняется, если **itemViewMode** установлено в *THREEx.CONST_ITEMS_MODE.GEOMETRY*. По умолчанию *THREEx.PLOT_TYPE.ITEM.CUBE*. Доступные значения:
  - *THREEx.PLOT_TYPE.MATERIAL.SPHERE* — сфера
  - *THREEx.PLOT_TYPE.MATERIAL.CUBE* — куб
  - *THREEx.PLOT_TYPE.MATERIAL.BAR* — столбец

### Опции графика (plotOptions)

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
* **axisLabelX** — Подпись оси X. По умолчанию *x*.
* **axisLabelY** — Подпись оси Y. По умолчанию *y*.
* **axisLabelZ** — Подпись оси Z. По умолчанию *z*.

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
