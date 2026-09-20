# Security

`wb-flow` is an automation tool for trusted local engineering work. Its trust boundary is the plan
file.

## Trust Model

- Verify cells are executed as shell commands. A plan row's `Verify` value is passed to `bash -c`
  during wave/oracle checks.
- Worker and validator agents may be launched with sandbox or approval bypass flags by design, so
  wave execution can edit files and run project commands without an interactive prompt.
- A plan file is markdown, but it is also operational input. Treat every plan file as executable
  code.

Only run `wb-flow wave`, `/wbWork --wave`, or any command that executes `Verify` cells on plans you
authored yourself or reviewed carefully. Do not run a plan from an untrusted repository, issue,
pull request, email, or chat transcript until you have inspected its task table and every command it
will execute.

`wb-flow lint --check-open-oracles` also executes `Verify` cells for open rows; use it only on
trusted plans for the same reason.

This is not a shell-quoting injection warning: `wb-flow` quotes the `Verify` cell before execution.
The risk is intentional authority. The command inside the cell is supposed to run.
