<script lang="ts">
  import { DEFAULT_MINUTES, DEFAULT_SECONDS } from "$lib/timer";
  import { timer } from "$lib/store"

  const width = 500
  const height = 500

  const outer = 250
  const strokeWidth = 30

  const r = outer - (strokeWidth / 2)
  const circumference = Math.floor(2 * Math.PI * r)

  let minutes = DEFAULT_MINUTES
  let seconds = DEFAULT_SECONDS

  $: dm = $timer.currentMinutes?.toString().padStart(2, "0")
  $: ds = $timer.currentSeconds?.toString().padStart(2, "0")

  let cirprogress = circumference

  const start = () => {
    timer.start(minutes, seconds, (startedAt, finishedAt, progress) => {
      if (progress <= 0) {
        timer.stop()
        cirprogress = circumference
        return
      }

      cirprogress = circumference * (progress / (finishedAt.getTime() - startedAt.getTime()))
    })
  }

  const resume = () => {
    timer.resume((startedAt, finishedAt, progress) => {
      if (progress <= 0) {
        timer.stop()
        cirprogress = circumference
        return
      }

      cirprogress = circumference * (progress / (finishedAt.getTime() - startedAt.getTime()))
    })
  }

  function stop() {
    timer.stop()
    cirprogress = circumference
  }
</script>

<main>
  <header> 
    <h1>timer.hrysd.org</h1>
  </header>

  <div class="timer__container">
    <svg class="timer" width="{width}" height="{height}">
      <circle
        cx="{outer}"
        cy="{outer}"
        fill="transparent"
        stroke="#aebdca"
        r="{r}"
        stroke-width="{strokeWidth}"
      />

      <circle
        class="timer__progress"
        cx="{outer}"
        cy="{outer}"
        fill="transparent"
        stroke="#7895b2"
        stroke-width="{strokeWidth}"
        r="{r}"
        stroke-dasharray={circumference}
        stroke-dashoffset={cirprogress}
        stroke-linecap="round"
        style="transform: rotate(-90deg); transform-origin: center"
      />
    </svg>

    <div class="timer">
      <span>{dm}:{ds}</span>

      <div>
        {#if $timer.timerId}
          <button on:click={timer.pause}>PAUSE</button>
        {:else if $timer.timerId === null && $timer.progress > 0}
          <button on:click={resume}>RESUME</button>
        {:else if $timer.timerId === null && $timer.progress === 0}
          <button on:click={start}>START</button>
        {/if}

        <button on:click={stop}>STOP</button>
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 10px;

    h1 {
      margin: 0;
    }
  }

  .timer__container {
    flex: 1;
    position: relative;
    text-align: center;
  }
  
  .timer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    span {
      font-size: 8rem;
    }
  }

  .timer__progress {
    transition: stroke-dashoffset .5s linear;
  }
</style>
