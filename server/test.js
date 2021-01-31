function example() {
    console.log("Its below new Error!");
    return new Promise((resolve, reject) => {
        throw new Error("test error outside");
        resolve({message:"success",data:{new:true,old:false}});
  });
}

try {
  example()
    .then((r) => console.log(`.then_success(${JSON.stringify(r)})`))
    .catch((e) => console.error(`.catch_err(${e})`));
} catch (e) {
  console.error(`Its out here: (${e})`);
}
