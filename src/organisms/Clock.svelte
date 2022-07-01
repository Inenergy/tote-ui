<script>
  import { formatTime } from '../utils/time';
  export let isTicking;
  let elapsed = 0;
  let interval;

  $: isTicking ? startCount() : stopCount();

  function startCount() {
    elapsed = 0;
    interval = setInterval(() => elapsed++, 1000);
  }

  function stopCount() {
    clearInterval(interval);
  }
</script>

<div>{formatTime(elapsed)}</div>

<style>
  div {
    font-family: 'Digital-7 Mono', monospace;
    font-size: 8rem;
    text-align: center;
  }
</style>
