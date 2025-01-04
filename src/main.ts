import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    // Get authenticated GitHub client (Octokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const apiToken = process.env['GITHUB_TOKEN'] as string
    const octokit = github.getOctokit(apiToken)

    // Get owner and repo from context of payload that triggered the action
    const {owner: currentOwner, repo: currentRepo} = github.context.repo
   
    const owner = core.getInput('owner', {required: false}) || currentOwner
    const repo = core.getInput('repo', {required: false}) || currentRepo
    
    // Update a release
    // API Documentation: https://developer.github.com/v3/repos/releases/#update-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/v16#repos-update-release
    const releases = await octokit.rest.repos.listReleases({
      owner,
      repo
    })

    if (releases.data.length === 0) {
      core.info('Aucune release trouvée.')
      return
    }

    core.info(`Nombre de releases trouvées: ${releases.data.length}`)

    for (const release of releases.data) {
      core.info(`Release: ${release.id} - ${release.name} - ${release.html_url}`)
      await octokit.rest.repos.updateRelease({
        owner,
        repo,
        release_id:release.id,
        draft: false

      })
      core.info(`Published release with id ${release.id}`)
    }

   

  
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
