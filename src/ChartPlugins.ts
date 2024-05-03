

export const customCanvasBackgroundColor = {
  // plugin to set canvas background color
  id: 'customCanvasBackgroundColor',
  // https://www.chartjs.org/docs/latest/configuration/canvas-background.html
  beforeDraw: (chart: {ctx: CanvasRenderingContext2D, width: number, height: number}, _args: unknown, options: {'color':string}) => {
    const {ctx} = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || 'black';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};
