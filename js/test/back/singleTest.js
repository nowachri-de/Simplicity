const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady } = require('../modules/browserready.js');

browserReady();
it('Test Autoencoder', function () {
  let result;
  let nN = 128; //each layer has 128 neurons
  let nZ = 10;  //latent vector has 10 neurons

  //writeArray('C:/nowak/development/git/Simplicity/js/test/data/vector1D128',randomNumbersAtScale1D(128,100));
  let dataIn = vector1D128;
  let target = dataIn;

  let l1 = new simplicity.Layer(nN, 'sigmoid');
  let l2 = new simplicity.Layer(nN, 'sigmoid');
  let l3 = new simplicity.Layer(nZ, 'sigmoid');
  let l4 = new simplicity.Layer(nN, 'sigmoid');
  let l5 = new simplicity.Layer(nN, 'sigmoid');

  let network = new simplicity.Network();
  network.addLayer(l1).addLayer(l2).addLayer(l3).addLayer(l4).addLayer(l5);

  for (let j = 0; j < 100; ++j) {
      for (let i = 0; i < 50; ++i) {
          result = network.feedForward(dataIn, target).feedForwardResult;
          network.backPropagate(0.5);
      }
      /*console.log("target");
      console.log(dataIn.toArray());
  
      console.log("result");
      console.log(l5.output.result.toArray());
      console.log("l1.weights");
      console.log(l1.weights.toArray());
      console.log("l1.bias");
      console.log(l1.biasWeights.toArray());*/
      //console.log(dataIn.toArray()[122] + "," + dataIn.toArray()[127]);
      //console.log(result.toArray()[122] + "," + result.toArray()[127]);
      //console.log(l1.biasWeights.toArray()[5]);
      console.log(network.getTotalError());
  }
});