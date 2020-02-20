import xyBase from '../xyBase';
import isIdentityScale from '../isIdentityScale';
import {
    webglSeriesLine,
    webglAdjacentElementAttribute,
    webglScaleMapper,
    webglTypes
} from '@d3fc/d3fc-webgl';
import { rebindAll, exclude, rebind } from '@d3fc/d3fc-rebind';

export default () => {
    const base = xyBase();

    const crossValueAttribute = webglAdjacentElementAttribute(-1, 2);
    const crossPreviousValueAttribute = crossValueAttribute.offset(-1);
    const crossNextValueAttribute = crossValueAttribute.offset(1);
    const crossNextNextValueAttribute = crossValueAttribute.offset(2);
    const mainValueAttribute = webglAdjacentElementAttribute(-1, 2);
    const mainPreviousValueAttribute = mainValueAttribute.offset(-1);
    const mainNextValueAttribute = mainValueAttribute.offset(1);
    const mainNextNextValueAttribute = mainValueAttribute.offset(2);
    const definedAttribute = webglAdjacentElementAttribute(0, 1).type(webglTypes.UNSIGNED_BYTE);
    const definedNextAttribute = definedAttribute.offset(1);

    const draw = webglSeriesLine()
        .crossPreviousValueAttribute(crossPreviousValueAttribute)
        .crossValueAttribute(crossValueAttribute)
        .crossNextValueAttribute(crossNextValueAttribute)
        .crossNextNextValueAttribute(crossNextNextValueAttribute)
        .mainPreviousValueAttribute(mainPreviousValueAttribute)
        .mainValueAttribute(mainValueAttribute)
        .mainNextValueAttribute(mainNextValueAttribute)
        .mainNextNextValueAttribute(mainNextNextValueAttribute)
        .definedAttribute(definedAttribute)
        .definedNextAttribute(definedNextAttribute);

    let equals = (previousData, data) => false;
    let previousData = [];

    const line = (data) => {
        const xScale = webglScaleMapper(base.xScale());
        const yScale = webglScaleMapper(base.yScale());

        if (!isIdentityScale(xScale.scale) || !isIdentityScale(yScale.scale) || !equals(previousData, data)) {
            previousData = data;

            if (base.orient() === 'vertical') {
                crossValueAttribute.value((d, i) => xScale.scale(base.crossValue()(d, i))).data(data);
                mainValueAttribute.value((d, i) => yScale.scale(base.mainValue()(d, i))).data(data);
            } else {
                crossValueAttribute.value((d, i) => xScale.scale(base.mainValue()(d, i))).data(data);
                mainValueAttribute.value((d, i) => yScale.scale(base.crossValue()(d, i))).data(data);
            }
            definedAttribute.value((d, i) => base.defined()(d, i)).data(data);
        }

        draw.xScale(xScale.glScale)
            .yScale(yScale.glScale)
            .decorate((program) => base.decorate()(program, data, 0));

        draw(data.length);
    };

    line.equals = (...args) => {
        if (!args.length) {
            return equals;
        }
        equals = args[0];
        return line;
    };

    rebindAll(line, base, exclude('baseValue', 'bandwidth', 'align'));
    rebind(line, draw, 'context', 'lineWidth');

    return line;
};
