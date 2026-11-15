let mounted = false

function mount() {
  if (mounted) return
  mounted = true

  import('./learningMap.jsx').then(({ mountInteractiveMap }) => {
    mountInteractiveMap()
  })
}

document.querySelectorAll('.view-switch-btn').forEach((btn) => {
  if (btn.dataset.view === 'map') {
    btn.addEventListener('click', mount)
  }
})
