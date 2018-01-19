'use strict'

const table = document.getElementById('currencies')
const thead = table.tHead
const tbody = table.tBodies[0]

function getRows () {
  return Array.from(tbody.rows)
}

function getCoinRowIndex (coin, rows) {
  return rows.findIndex(r => r.id === 'id-' + coin)
}

function renderFavs () {
  chrome.storage.sync.get('favs', (data) => {
    const favs = data.favs || []
    const rows = getRows()

    favs.sort((a, b) => getCoinRowIndex(a, rows) - getCoinRowIndex(b, rows))

    document.querySelectorAll('.x-fav-row').forEach(r => r.remove())

    favs.forEach(coin => {
      toggleFavRow(coin, true)
    })
  })
}

function onFavLinkClick (favLink) {
  const coin = favLink.getAttribute('data-x-coin')
  const isFav = favLink.parentNode.parentNode.classList.contains('x-fav-row')

  if (!isFav && document.querySelector(`#id-${coin}.x-fav-row`)) {
    return
  }

  toggleFavRow(coin, !isFav)

  chrome.storage.sync.get('favs', (data) => {
    const favs = data.favs || []

    if (isFav) {
      favs.splice(favs.indexOf(coin), 1)
    } else {
      favs.push(coin)
    }

    chrome.storage.sync.set({ favs }, () => {
      renderFavs()
    })
  })
}

function toggleFavRow (coin, add) {
  if (add) {
    const row = tbody.querySelector('#id-' + coin)
    const clonedRow = row.cloneNode(true)
    clonedRow.classList.add('x-fav-row')
    thead.appendChild(clonedRow)
  } else {
    const row = thead.querySelector('#id-' + coin)
    row.remove()
  }
}

function init () {
  table.addEventListener('click', function (evt) {
    if (evt.target.classList.contains('sortable')) {
      renderFavs()
    }

    const clickedToggleFav = evt.path.find(el => el.className === 'x-toggle-fav')
    if (clickedToggleFav) {
      onFavLinkClick(clickedToggleFav)
    }
  })

  const favLink = document.createElement('a')
  favLink.className = 'x-toggle-fav'
  favLink.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 742.8 710">
      <g>
        <path d="M741.6 269.3c-4.2-12.2-18.3-25.3-136.3-39.1-47-5.5-93.6-9-111.7-10.2-6.6-16.9-23.9-60.1-43.3-103C401.4 9.1 383.7 0 370.9 0c-12.7 0-30.5 9.1-79.8 117.2-19.6 42.9-37.1 86.3-43.9 103-18 1.1-64 4.4-110.5 9.6-117.1 13.3-131.3 27-135.5 38.8-.7 2-1.2 4.2-1.2 6.8 0 13.4 14 37.7 87.7 105.3 34.9 32 70.7 62.2 84.7 73.9-4.5 17.6-15.7 62.8-25.1 109.3C136 619.2 132 652.2 132 672.5c0 22.4 4.9 29.2 10.1 33.2 10.6 7.9 29.6 10.8 133.8-48 41.5-23.4 81.4-48.2 96.9-58 15.3 9.7 54.8 34.2 95.8 57.3 102.9 58.2 122.6 56 132.9 49.4 6.1-3.9 11.5-10.6 11.5-34.2 0-20.5-4-53.6-15.1-108.6-9.5-47.1-21-93.4-25.5-111.2 13.9-11.5 49.2-41.1 83.7-72.5 73-66.7 86.8-90.5 86.8-103.9-.1-2.5-.5-4.6-1.3-6.7" />
      </g>
    </svg>`

  getRows().forEach(row => {
    const l = favLink.cloneNode(true)
    l.setAttribute('data-x-coin', row.id.replace('id-', ''))
    row.cells[1].appendChild(l)
  })

  renderFavs()
}

init()
