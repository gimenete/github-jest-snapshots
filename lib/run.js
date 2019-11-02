const request = require('./request')
const snapshots = require('./')

const { GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_WORKSPACE, GH_TOKEN } = process.env
const GITHUB_TOKEN = GH_TOKEN
const event = require(GITHUB_EVENT_PATH)
const { repository } = event
const {
  owner: { login: owner }
} = repository
const { name: repo } = repository

const checkName = 'Jest snapshots'

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/vnd.github.antiope-preview+json',
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  'User-Agent': 'jest-snapshots'
}

async function createCheck() {
  const body = {
    name: checkName,
    head_sha: GITHUB_SHA,
    status: 'in_progress',
    started_at: new Date()
  }

  const { data } = await request(`https://api.github.com/repos/${owner}/${repo}/check-runs`, {
    method: 'POST',
    headers,
    body
  })
  const { id } = data
  return id
}

async function updateCheck(id, conclusion, output) {
  const body = {
    name: checkName,
    head_sha: GITHUB_SHA,
    status: 'completed',
    completed_at: new Date(),
    conclusion,
    output
  }

  await request(`https://api.github.com/repos/${owner}/${repo}/check-runs/${id}`, {
    method: 'PATCH',
    headers,
    body
  })
}

function exitWithError(err) {
  console.error('Error', err.stack)
  if (err.data) {
    console.error(err.data)
  }
  process.exit(1)
}

async function run() {
  const id = await createCheck()
  try {
    const annotations = snapshots(GITHUB_WORKSPACE)
    const output = {
      title: checkName,
      summary: '',
      annotations
    }
    await updateCheck(id, 'success', output)
  } catch (err) {
    await updateCheck(id, 'failure')
    exitWithError(err)
  }
}

run().catch(exitWithError)
