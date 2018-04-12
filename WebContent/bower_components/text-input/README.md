[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/fooloomanzoo/text-input)
[![API](https://img.shields.io/badge/API-available-green.svg)](https://www.webcomponents.org/element/fooloomanzoo/text-input/elements/text-input)
[![Demo](https://img.shields.io/badge/demo-available-red.svg)](https://www.webcomponents.org/element/fooloomanzoo/text-input/demo/demo/index.html)

_[API](https://fooloomanzoo.github.io/text-input/components/text-input/#/elements/text-input)_ and
_[Demo](https://fooloomanzoo.github.io/text-input/components/text-input/#/elements/text-input/demos/demo/index.html)_

## \<text-input\>

An input for text values.

### Motivation

The normal `input` with `type="text"` is fairly good to use, but it has some flaws, because it should if wanted e.g.:

* guarantee **live**-value to be valid
* to be styled easily

### Example

<!--
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-lite.js"></script>

    <link rel="import" href="text-input.html">
    <dom-bind>
      <template is="dom-bind">
        <custom-style>
          <style is="custom-style">
            #hex {
              --text-input-allign: center;
              --text-input: {
                color: #111;
                padding: 0.5em;
                border-radius: 0.5em;
                border-color: #ddd;
                border-style: dotted;
                transition: background-color 250ms ease-in-out;
              };
              --text-input-focus: {
                border-color: #555;
                border-style: solid;
                background: rgba(0, 0, 0, 0.15);
              };
              --text-input-placeholder: {
                color: #492020;
              };
              --text-input-invalid: {
                background: rgba(255, 0, 0, 0.15);
                border-color: #999;
                border-style: dashed;
              };
            }
          </style>
        </custom-style>

        <next-code-block></next-code-block>
      </template>
    </dom-bind>
  </template>
</custom-element-demo>
```
-->
```html
  <p>
    hex-color: <text-input id="hex" value="{{value}}" input="{{input}}" default="#111" required pattern="^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" size="7" maxlength="7" minlength="4"></text-input>
  </p>
  <p>pattern: <b>^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$</b></p>
  <p>input: <b>[[input]]</b></p>
  <p>value: <b>[[value]]</b></p>
```

### Styling
Have a look at [input-picker-pattern#input-shared-style](https://github.com/fooloomanzoo/input-picker-pattern#input-shared-style) to see how to style the element.

### Installation
```
bower install --save fooloomanzoo/text-input
```

### License
[MIT](https://github.com/fooloomanzoo/text-input/blob/master/LICENSE.txt)
