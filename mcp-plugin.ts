import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ROOT = process.cwd()
const CMD_TIMEOUT = 30_000

function safePath(filePath: string): string {
  const resolved = path.resolve(ROOT, filePath)
  if (!resolved.startsWith(ROOT)) throw new Error('Path outside project root')
  return resolved
}

function readFile(filePath: string): string {
  return fs.readFileSync(safePath(filePath), 'utf-8')
}

function writeFile(filePath: string, content: string): void {
  const full = safePath(filePath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf-8')
}

function deleteFile(filePath: string): void {
  fs.unlinkSync(safePath(filePath))
}

function listDir(dirPath: string): string[] {
  const full = safePath(dirPath)
  return fs.readdirSync(full, { withFileTypes: true })
    .map(e => e.isDirectory() ? `${e.name}/` : e.name)
}

function findComponent(name: string): string {
  const base = name.replace(/\.tsx?$/, '')
  const candidates = [
    `src/components/${base}.tsx`,
    `src/components/${base}.ts`,
    `src/components/ui/${base}.tsx`,
    `src/components/figma/${base}.tsx`,
  ]
  for (const p of candidates) {
    try { return readFile(p) } catch {}
  }
  throw new Error(`Component not found: ${name}`)
}

function runShellSync(command: string, timeoutMs: number = CMD_TIMEOUT): string {
  try {
    const output = execSync(command, {
      cwd: ROOT,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024,
      encoding: 'utf-8',
      env: { ...process.env },
    })
    return output
  } catch (err: any) {
    const stderr = err.stderr?.toString() || ''
    const stdout = err.stdout?.toString() || ''
    return `Exit code: ${err.status ?? 'unknown'}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`
  }
}

function searchFiles(pattern: string, globFilter?: string, directory?: string): string {
  const dir = directory || '.'
  let cmd = `grep -rn --include='*.{ts,tsx,js,jsx,css,json,md,html}' -E ${JSON.stringify(pattern)} ${JSON.stringify(dir)}`
  if (globFilter) {
    cmd = `grep -rn --include=${JSON.stringify(globFilter)} -E ${JSON.stringify(pattern)} ${JSON.stringify(dir)}`
  }
  try {
    return execSync(cmd, { cwd: ROOT, timeout: 10_000, encoding: 'utf-8', maxBuffer: 512 * 1024 })
  } catch (err: any) {
    if (err.status === 1) return 'No matches found.'
    return `Search error: ${err.stderr?.toString() || err.message}`
  }
}

function getFileTree(dir: string = '.', depth: number = 4): string {
  try {
    return execSync(
      `find ${JSON.stringify(dir)} -maxdepth ${depth} -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/build/*' -not -path '*/.local/*' | sort`,
      { cwd: ROOT, timeout: 10_000, encoding: 'utf-8', maxBuffer: 512 * 1024 }
    )
  } catch (err: any) {
    return `Error: ${err.message}`
  }
}

const TOOLS = [
  {
    name: 'read_file',
    description: 'Read the contents of any file in the project',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to project root, e.g. src/components/Hero.tsx' }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write or update a file in the project. Provide the full file content.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to project root' },
        content: { type: 'string', description: 'Full file content to write' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'delete_file',
    description: 'Delete a file from the project',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to project root' }
      },
      required: ['path']
    }
  },
  {
    name: 'list_files',
    description: 'List files in a directory of the project',
    inputSchema: {
      type: 'object',
      properties: {
        directory: { type: 'string', description: 'Directory relative to project root (default: src/components)' }
      }
    }
  },
  {
    name: 'get_file_tree',
    description: 'Get the full project file tree structure (excluding node_modules, .git, build)',
    inputSchema: {
      type: 'object',
      properties: {
        directory: { type: 'string', description: 'Starting directory (default: project root)' },
        depth: { type: 'number', description: 'Max depth of tree traversal (default: 4)' }
      }
    }
  },
  {
    name: 'get_component',
    description: 'Get the source code of a React component by name',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Component name, e.g. Hero, Navigation, Footer' }
      },
      required: ['name']
    }
  },
  {
    name: 'get_project_context',
    description: 'Get the project second-brain context (.replit.md) including tech stack, golden rules, and structure',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'run_command',
    description: 'Execute a shell command in the project root. Use for npm scripts, builds, linting, testing, or any CLI operation.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Shell command to execute, e.g. "npm run build"' },
        timeout_ms: { type: 'number', description: 'Timeout in milliseconds (default: 30000, max: 120000)' }
      },
      required: ['command']
    }
  },
  {
    name: 'search_codebase',
    description: 'Search across all project files using regex patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Regex pattern to search for' },
        glob: { type: 'string', description: 'File glob filter, e.g. "*.tsx"' },
        directory: { type: 'string', description: 'Directory to search in (default: entire project)' }
      },
      required: ['pattern']
    }
  },
  {
    name: 'install_package',
    description: 'Install an npm package into the project',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: { type: 'string', description: 'Package name with optional version' },
        dev: { type: 'boolean', description: 'Install as dev dependency (default: false)' }
      },
      required: ['package_name']
    }
  },
  {
    name: 'uninstall_package',
    description: 'Remove an npm package from the project',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: { type: 'string', description: 'Package name to remove' }
      },
      required: ['package_name']
    }
  },
  {
    name: 'git_status',
    description: 'Get current git status, branch, and recent commit history',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'git_diff',
    description: 'Get the git diff showing all uncommitted changes',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Git ref to diff against (default: HEAD)' }
      }
    }
  },
  {
    name: 'git_commit',
    description: 'Stage all changes and create a git commit',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Commit message' }
      },
      required: ['message']
    }
  },
  {
    name: 'screenshot',
    description: 'Get the current public URL of the running app for visual validation',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'restart_dev_server',
    description: 'Restart the Vite dev server to pick up config or dependency changes.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_diagnostics',
    description: 'Run TypeScript type-checking on the project and return any errors or warnings',
    inputSchema: { type: 'object', properties: {} }
  }
]

async function callTool(name: string, args: Record<string, any>): Promise<string> {
  switch (name) {
    case 'read_file': return readFile(args.path)
    case 'write_file': writeFile(args.path, args.content); return `Written: ${args.path}`
    case 'delete_file': deleteFile(args.path); return `Deleted: ${args.path}`
    case 'list_files': return listDir(args.directory || 'src/components').join('\n')
    case 'get_file_tree': return getFileTree(args.directory || '.', args.depth || 4)
    case 'get_component': return findComponent(args.name)
    case 'get_project_context': return readFile('.replit.md')
    case 'run_command': return runShellSync(args.command, Math.min(args.timeout_ms || CMD_TIMEOUT, 120_000))
    case 'search_codebase': return searchFiles(args.pattern, args.glob, args.directory)
    case 'install_package': return runShellSync(`npm install ${args.dev ? '--save-dev' : '--save'} ${args.package_name}`, 60_000)
    case 'uninstall_package': return runShellSync(`npm uninstall ${args.package_name}`, 30_000)
    case 'git_status': return runShellSync('git status --short && echo "---BRANCH---" && git branch --show-current && echo "---LOG---" && git log --oneline -10')
    case 'git_diff': return runShellSync(`git diff ${args.ref || 'HEAD'} --stat && git diff ${args.ref || 'HEAD'}`)
    case 'git_commit': return runShellSync(`git add -A && git commit -m ${JSON.stringify(args.message)}`)
    case 'screenshot': return `App URL: https://${process.env.REPLIT_DEV_DOMAIN}/`
    case 'restart_dev_server': return 'Send SIGHUP or restart via Replit workflow controls.'
    case 'get_diagnostics': return runShellSync('npx tsc --noEmit --pretty 2>&1 || true', 60_000)
    default: throw new Error(`Unknown tool: ${name}`)
  }
}

export function mcpPlugin(): Plugin {
  return {
    name: 'bkt-mcp-server',
    configureServer(server) {
      server.middlewares.use('/mcp', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, mcp-session-id')
        res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id')

        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
        if (req.method === 'DELETE') { res.writeHead(200); res.end(); return }
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'text/event-stream')
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('Connection', 'keep-alive')
          res.writeHead(200)
          res.write(': BKT Advisory MCP Server\n\n')
          req.on('close', () => res.end())
          return
        }
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('mcp-session-id', 'bkt-advisory-session')

          let parsed: any
          try { parsed = JSON.parse(body) } catch {
            res.writeHead(400)
            res.end(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }))
            return
          }

          const messages = Array.isArray(parsed) ? parsed : [parsed]
          const responses: any[] = []

          for (const msg of messages) {
            const { method, params, id } = msg
            if (method === 'notifications/initialized' || method === 'notifications/cancelled') continue

            let result: any, error: any
            try {
              switch (method) {
                case 'initialize':
                  result = { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'bkt-advisory-mcp', version: '1.0.0' } }
                  break
                case 'ping': result = {}; break
                case 'tools/list': result = { tools: TOOLS }; break
                case 'tools/call': {
                  const toolName = params?.name
                  const toolArgs = params?.arguments ?? {}
                  try {
                    const text = await callTool(toolName, toolArgs)
                    result = { content: [{ type: 'text', text: String(text) }] }
                  } catch (err: any) {
                    result = { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true }
                  }
                  break
                }
                default: error = { code: -32601, message: `Method not found: ${method}` }
              }
            } catch (err: any) {
              error = { code: -32603, message: err.message }
            }

            if (id !== undefined && id !== null) {
              responses.push(error ? { jsonrpc: '2.0', id, error } : { jsonrpc: '2.0', id, result })
            }
          }

          if (responses.length === 0) { res.writeHead(202); res.end() }
          else { res.writeHead(200); res.end(JSON.stringify(responses.length === 1 ? responses[0] : responses)) }
        })
      })
    }
  }
}
