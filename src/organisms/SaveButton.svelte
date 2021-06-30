<script>
  import Button from '../atoms/Button';
  export let disabled;
  import { __ } from '../utils/translations';
  import { ipcRenderer } from 'electron';
  import { fly } from 'svelte/transition';

  let isSaving,
    isSaveFailed,
    saveMessage,
    isActive = true,
    usbConnected;

  ipcRenderer.send('usbStorageRequest');

  ipcRenderer
    .on('usbConnected', () => (usbConnected = true))
    .on('usbDisconnected', () => {
      usbConnected = false;
      saveMessage = '';
    });

  function handleClick() {
    isActive = false;
    isSaving = true;
    ipcRenderer.send('saveFile');
    ipcRenderer.on('fileSaved', handleSaved);
  }
  function handleSaved(e, err) {
    if (err) {
      saveMessage = 'save failed';
      isSaveFailed = true;
    } else {
      saveMessage = 'file saved';
    }
    isActive = true;
    isSaving = false;
  }
  function closePopup() {
    saveMessage = void 0;
    isSaveFailed = false;
  }
  function ejectUSB() {
    ipcRenderer.send('ejectUSB', closePopup);
  }
  ipcRenderer.on('usbDisconnected', closePopup);
</script>

<Button
  style="width:42rem"
  on:click={handleClick}
  disabled={disabled || !usbConnected}>
  {#if isSaving}
    <span class="spinner" />
    {$__('saving file')}
  {:else}{$__('save file')}{/if}

</Button>
{#if saveMessage}
  <div class="popup" transition:fly={{ y: -200 }}>
    <span on:click={closePopup} class="popup-close">x</span>
    <p>{$__(saveMessage)}</p>
    <Button on:click={ejectUSB} size="sm">{$__('eject')}</Button>
  </div>
{/if}

<style>
  .spinner {
    display: inline-block;
    width: 1.8rem;
    height: 1.8rem;
    border: 2px solid var(--bg-color);
    clip-path: polygon(0 0, 50% 0, 50% 50%, 100% 50%, 100% 100%, 0 100%);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .popup {
    position: fixed;
    top: 1rem;
    left: calc(50% - 15rem);
    width: 30rem;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 1.6rem;
    z-index: 9001;
    background-color: var(--bg-color);
    text-align: left;
  }
  .popup-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    color: var(--coporate-grey-darken);
  }
</style>
