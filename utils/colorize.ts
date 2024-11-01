import chalk from "chalk"

function colorize_info(text: string) {
  console.log(chalk.rgb(170, 135, 92)(text))
}
function colorize_success(text: string) {
  console.log(chalk.hex("#81BE83")(text)) // Payton
}
function colorize_error(text: string) {
  console.log(chalk.hex("#7E4AB8")(text))
}
function colorize_mark(text: string) {
  console.log(chalk.black.bgHex("#1c96c5")(text)) // Cornflower Blue
}
function colorize_mark2(text: string) {
  console.log(chalk.black.bgHex("#5A855C ")(text)) // Middle Green
}
function colorize_mark3(text: string) {
  console.log(chalk.black.bgHex("#3E517A")(text)) // Metalic Blue
}
function colorize_mark4(text: string) {
  console.log(chalk.black.bgHex("#7E4AB8 ")(text)) // Azela Purple
}
function colorize_mark5(text: string) {
  console.log(chalk.black.bgRgb(170, 135, 92)(text)) // Azela Purple
}

export {
  colorize_info,
  colorize_success,
  colorize_error,
  colorize_mark,
  colorize_mark2,
  colorize_mark3,
  colorize_mark4,
  colorize_mark5,
}
