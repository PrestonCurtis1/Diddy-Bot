async function isEven(num){
    num = num.toString();
    if (num.endsWith("0"))return true;
    if (num.endsWith("1"))return false;
    if (num.endsWith("2"))return true;
    if (num.endsWith("3"))return false;
    if (num.endsWith("4"))return true;
    if (num.endsWith("5"))return false;
    if (num.endsWith("6"))return true;
    if (num.endsWith("7"))return false;
    if (num.endsWith("8"))return true;
    if (num.endsWith("9"))return false;
    
}
let number = 10
let numIsEven = await isEven(number)
console.log(numIsEven);