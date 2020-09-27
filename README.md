# Format Code

## Steps

- Identify tag
-- Extract content
- Identify class style and extract all attributes of the style
-- color (https://www.figma.com/plugin-docs/api/RGB/)
- Remove tags
- Identify position
-- start and end (https://www.figma.com/plugin-docs/api/TextNode/#setrangefills)

- Create a new range fill. Add in an array to apply in the node
-- setRangeFills(start: number, end: number, value: Paint[]): void (https://www.figma.com/plugin-docs/api/TextNode/#setrangefills)

```json
{
    blendMode: 'NORMAL',
    color: {r: 0.1564236283302307, g: 0.24472922086715698, b: 0.7083333134651184},
    opacity: 1,
    type: 'SOLID',
    visible: true
}
```

## Reference

- https://github.com/figma/plugin-samples
- https://github.com/yuanqing/create-figma-plugin
- https://github.com/highlightjs/highlight.js
- https://github.com/thomas-lowry/themer
- https://github.com/oriziv/figma-sass-less-plugin
- Parsers: https://prettier.io/docs/en/options.html#parser