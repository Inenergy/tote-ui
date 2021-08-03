<script>
  import { data } from '../stores';
  import { CRITICAL_CONCENTRATION } from '../constants';
  import { __ } from '../utils/translations';

  $: isGasLeak = $data.gasConcentration > CRITICAL_CONCENTRATION;
</script>

{#if isGasLeak}
  <div class="warnings">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 42.07" class="icon">
      <path
        d="M47.75,41.14a1.86,1.86,0,0,1-1.6.93H1.85a1.86,1.86,0,0,1-1.6-2.79L22.39.93a1.86,1.86,0,0,1,3.22,0L47.75,39.28A1.87,1.87,0,0,1,47.75,41.14Z"
        fill="var(--warning-color)"
      />
      <path
        d="M44.8,41.23H3.2a1.74,1.74,0,0,1-1.52-2.61l20.81-36h0a1.75,1.75,0,0,1,3,0l20.81,36a1.74,1.74,0,0,1-1.52,2.61ZM4.71,38.62H43.29L24,5.2ZM24.76,3.89ZM24,36.65a2.84,2.84,0,1,0-2.84-2.83A2.84,2.84,0,0,0,24,36.65Zm-.13-7.18A1,1,0,0,0,25,28.58l1.67-13.53a2.43,2.43,0,0,0,0-.66,2.71,2.71,0,0,0-5.38.66L23,28.58A1,1,0,0,0,23.87,29.47Z"
        fill="var(--text-color)"
      />
    </svg>
  </div>
{/if}

<style>
  .warnings {
    position: fixed;
    display: flex;
    align-items: center;
    top: 24px;
    right: 24px;
    max-width: 12rem;
    z-index: 9001;
  }
  .warnings > * {
    margin-left: 8px;
  }
  svg {
    animation: blink 1s linear infinite alternate;
    height: 5rem;
  }
</style>
