<script>
  import Chart from 'chart.js';
  import 'chartjs-plugin-zoom';
  import Version from '../atoms/Version.svelte';
  import Switch from '../atoms/Toggle.svelte';
  import Button from '../atoms/Button';
  import { onMount } from 'svelte';
  import { data } from '../stores';
  import config from './chart.config';
  import SaveButton from '../organisms/SaveButton';
  import Clock from '../organisms/Clock';
  import RangeInput from '../molecules/RangeInput';
  import { ipcRenderer } from 'electron';
  import { DATA, COMMANDS, CONSTRAINTS } from '../constants';
  import { __ } from '../utils/translations';
  import Warnings from '../atoms/Warnings.svelte';
  export let chart;

  const displayedParams = [
      'cellVoltage',
      'cellCurrent',
      'cellTemp',
      'cellLoad',
      'fuelConsumption',
    ],
    initialState = $data;

  let points = [],
    isTicking,
    isActive;

  onMount(() => {
    config.options.scales.xAxes[0].scaleLabel.labelString = 'I, ' + $__('mA');
    config.options.scales.yAxes[0].scaleLabel.labelString = 'U, ' + $__('mV');
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      config
    );
    chart.options.onClick = chart.resetZoom;
    chart.data.datasets[0].data = points;
    monitorData();
  });

  function monitorData() {
    data.subscribe((data) => {
      if (data.cellCurrent) {
        if (!isActive) startDrawing();
        addPoint({ y: data.cellVoltage, x: data.cellCurrent });
        ipcRenderer.send('logRow', [
          data.cellVoltage,
          data.cellCurrent,
          data.cellTemp,
        ]);
      } else if (isActive) isActive = false;
    });
  }

  function addPoint(p) {
    points.push(p);
    chart.update();
  }

  function startDrawing() {
    isActive = true;
    points = [];
    chart.data.datasets[0].data = points;
    ipcRenderer.send('startLog', [`U, mV`, `I, mA`, 'T, °C']);
  }

  function getIVC() {
    ipcRenderer.send('serialCommand', COMMANDS.getIV());
  }

  function changeCellTemp(temp) {
    ipcRenderer.send('serialCommand', COMMANDS.setCellTemp(temp));
  }

  function changeFuelConsumption(consumption) {
    ipcRenderer.send('serialCommand', COMMANDS.setFuelConsumption(consumption));
  }

  function toggleThermistor(e) {
    ipcRenderer.send(
      'serialCommand',
      COMMANDS.switchThermistor(+e.target.checked)
    );
    isTicking = e.target.checked;
  }
</script>

<Warnings />
<Version />
<div class="layout">
  <header>{$__('operation characteristics')}</header>
  <main>
    <div class="params">
      {#each displayedParams as key}
        <div class="param">
          <span class="label"
            >{$__(DATA[key].label)}, {$__(DATA[key].units)}:</span
          >
          <strong class="value">{$data[key]}</strong>
        </div>
      {/each}
      <div class="param ">
        <span class="label">{$__('heater')}</span>
        <Switch on:change={toggleThermistor} />
      </div>
      <div class="param special">
        <div class="centered-label">{$__('set temperature')}, {'\u02daC'}:</div>
        <RangeInput
          style="margin:auto"
          defaultValue={initialState.cellTemp}
          step={10}
          range={CONSTRAINTS.cellTemp}
          onChange={changeCellTemp}
          value={$data.cellTemp}
        />
      </div>
      <div class="param special">
        <div class="centered-label">{$__('set fuel consumption')}, {$__('ml/min')}:</div>
        <RangeInput
          style="margin:auto"
          defaultValue={initialState.fuelConsumption}
          step={5}
          range={CONSTRAINTS.fuelConsumption}
          onChange={changeFuelConsumption}
          value={$data.fuelConsumption}
        />
      </div>
      <div class="param special">
        <div class="centered-label">{$__('elapsed time')}:</div>
        <Clock {isTicking} />
      </div>
    </div>
    <div class="chart">
      <canvas id="chart" height="220" />
    </div>
  </main>
  <footer>
    <Button on:click={getIVC} style="margin-left: auto; margin-right: 1.6rem;">
      {$__('get IVC')}
    </Button>
    <SaveButton disabled={!points.length && !isActive} />
  </footer>
</div>

<style>
  main {
    padding: 0 24px;
    display: flex;
  }
  .label {
    display: inline-block;
    width: 70%;
    text-align: right;
    margin-right: 1rem;
    font-weight: 300;
  }
  .centered-label {
    width: 100%;
    text-align: center;
    font-weight: lighter;
    margin-bottom: 1.2rem;
  }
  .params {
    width: 36%;
  }
  .param {
    margin: 1.2rem 0;
    font: 2.5rem 'Oswald';
  }
  .value {
    font-weight: 400;
  }
  .chart {
    flex-grow: 1;
  }
  #chart {
    margin: auto;
  }
  footer {
    display: flex;
    align-items: center;
  }
</style>
