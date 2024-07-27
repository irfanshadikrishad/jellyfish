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
  console.log(chalk.black.bgCyan(text)); // cyan
}
function colorize_mark2(text: string) {
  console.log(chalk.black.bgHex("#588157")(text)); //fern-green
}
function colorize_mark3(text: string) {
  console.log(chalk.black.bgHex("#3E517A")(text));
}

export {
  colorize_info,
  colorize_success,
  colorize_error,
  colorize_mark,
  colorize_mark2,
  colorize_mark3,
};
