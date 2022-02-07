import { readdirSync } from 'fs'

export default function plop(plop) {
  const templates = readdirSync('./templates')

  templates.forEach((template) => {
    const name = template.replace(/\.ts(\.hbs)?$/, '')

    plop.setGenerator(name, {
      prompts: [
        {
          type: 'input',
          name: 'filename',
          message: 'name of your function:',
        },
      ],
      actions: [
        {
          type: 'add',
          path: `./api/{{ filename }}.ts`,
          templateFile: `./templates/${template}`,
        },
      ],
    })
  })
}
