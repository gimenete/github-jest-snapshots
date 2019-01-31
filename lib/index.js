const jestSnapshot = require('jest-snapshot')
const babelParser = require('@babel/parser')
const traverse = require('@babel/traverse').default

const fs = require('fs')
const path = require('path')

module.exports = (workspace) => {
  const annotations = []

  const pickStringArgument = path => {
    const arg = path.node.expression.arguments[0]
    if (arg.type !== 'StringLiteral') return null
    return arg.value
  }

  const traverseFiles = dir => {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    files.forEach(file => {
      if (file.name === 'node_modules') return

      const fullPath = path.join(dir, file.name)
      if (file.isDirectory()) return traverseFiles(fullPath)

      const snapshotFile = path.join(dir, '__snapshots__', file.name + '.snap')
      if (fs.existsSync(snapshotFile)) {
        const snapshot = jestSnapshot.utils.getSnapshotData(snapshotFile)
        const code = fs.readFileSync(fullPath, 'utf-8')
        const ast = babelParser.parse(code)

        const paths = []
        let testName = null
        let snapshotNumber = 0

        const pushPath = path => {
          const last = paths[paths.length - 1]
          if (last && !last.isAncestor(path)) {
            snapshotNumber = 0
            paths.splice(0)
          }
          paths.push(path)
          testName = paths.map(pickStringArgument).join(' ')
        }

        traverse(ast, {
          ExpressionStatement(path) {
            const { node } = path
            const { callee } = node.expression
            if (!callee) return

            if (callee.type === 'Identifier' && ['describe', 'test'].includes(callee.name)) {
              pushPath(path)
            }
          },
          CallExpression(path) {
            const { node } = path
            const { callee } = node
            if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier' && callee.property.name === 'toMatchSnapshot') {
              snapshotNumber++
              const snapshotName = testName + ' ' + snapshotNumber
              const line = callee.property.loc.start.line

              const relativePath = fullPath.substring(workspace.length + 1)
              annotations.push({
                path: relativePath,
                start_line: line,
                end_line: line,
                annotation_level: 'notice',
                message: '',
                raw_details: snapshot.data[snapshotName]
              })
            }
          }
        })
      }
    })
  }

  traverseFiles(workspace)
  console.log('annotations:', JSON.stringify(annotations, null, 2))
  return annotations
}
