import chalk from "chalk";

function colorize_info(text: string) {
  console.log(chalk.rgb(170, 135, 92)(text));
}
function colorize_success(text: string) {
  console.log(chalk.green(text));
}
function colorize_error(text: string) {
  console.log(chalk.magenta(text));
}
function colorize_mark(text: string) {
  console.log(chalk.black.bgCyan(text));
}

export { colorize_info, colorize_success, colorize_error, colorize_mark };
