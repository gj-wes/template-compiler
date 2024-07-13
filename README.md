# Template Compiler

Simple Vite HTML transformer to compile HTML components into a single output file. Built to help me manage HTML email templates.

## Installation
1. Clone the repository
```bash
git clone https://github.com/gj-wes/template-compiler.git
```
2. Navigate to project directory
```bash
cd template-compiler
```
3. Install dependencies
```bash
npm install
```

## Usage
Dev server with live updates for the `index.html`.
```bash
npm run dev
```

Will output the compiled version of the `index.html` to the `output` directory.
```bash
npm run build
```

### Using Components
Components are HTML files that can be reused throughout the template build.

Components are saved as HTML files and saved in the `components` directory. These component can then be used in the `index.html` by using the `<component>` element with the path to the component HTML added to the `src`.
```html
<p>
  <!-- Some standard links -->
  &copy; 2024. Company address.
</p>
```

```html
<component src="components/footer.html" />
```

### Slots
Content can be passed into a components via a `slot` element. 
```html
<slot name="" />
```
Slot **must have a name** for it to work, there is no default slot option (this may change in the future).
```html
<component src="components/card.html">
  <slot name="copy">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam, facere.
  </slot>
</component>
```
### Props
Props can be set within a component and then passed down via the `props` attribute in an object syntax.
```html
<component src="components/border-box.html" props='{"border":"2px solid red"}' />
```
```html
<div style="border:{{border}}">
```
### Class passthrough
Any CSS classes added to the `component` element will be passed through and merged with any classes on the parent element of the component HTML.
```html
<component src="components/copy.html" class="text-right" />
```
```html
<p class="mx90">
```
Will output in build as
```html
<p class="mx90 text-right">
```