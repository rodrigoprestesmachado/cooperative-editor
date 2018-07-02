function diff_rodrigo(texts) {
				
		// Test cases
		// three participations
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestes Machado", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"RodrABC Prestes", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodryygo", owner:"B"}, {text:"Rodryygo Prestes", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigoo Prrestis", owner:"C"}];
		
		// More than three participations
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestes Machado", owner:"C"}, {text:"Rodrigo Prestes Machado!!", owner:"A"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestes Machado", owner:"C"}, {text:"Rodrigo Prestes Myychado", owner:"A"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestis Machado", owner:"C"}, {text:"Roodrigo Prestis Machado", owner:"A"}];
		
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestes Machado", owner:"C"}, {text:"Rodrigo Prestes Machado: primeiro", owner:"A"}, {text:"Rodrigo Prestes Machado: primeiro segundo", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prestis Machado", owner:"C"}, {text:"Rodrigo Prestis Machado: primeiro", owner:"A"}, {text:"Rodrigo Prestis Machado: Primeiro, segundo", owner:"C"}];
		// Remove
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrigo Prestes", owner:"B"}, {text:"Rodrigo Prest", owner:"C"}, {text:"Rodrigo Prestes", owner:"C"}];
		//var texts = [{text:"Rodrigo", owner:"A"}, {text:"Rodrgo", owner:"B"}, {text:"Rodrigo Prestes", owner:"C"}];
		
		
		var diff;
		var previous = "";
		var results;
		var previousResults = new Array();
		for (var i = 0; i < (texts.length - 1); i++) {
			
			results = new Array();
			if (previous === "")
				diff = JsDiff.diffChars(texts[i].text, texts[i+1].text);
			else{
				diff = JsDiff.diffChars(previous, texts[i+1].text);
				previous = "";
			}
			
			// Indicates the number of characters already discovered in the previous 
			// string. It is used to know start point to cut the string of the new part
			var discovered = 0;
			
			// Indicates the number of characters that still need to be discovered
			var remaining = 0;
			
			// Stores the number of characters of the mutation in the value of a part 
			// (added or modified) 
			var mutation = 0;
			
			diff.forEach(function(part){
				 var splitPoint = "";
				 var owner = "";
				 if (! part.removed ){
					 if (part.added){
						 results.push({part:part, owner:texts[i+1].owner});
						 mutation += part.count;
					 }
					 else{
						 // We are discovering a new string
						 discovered = 0;
						 
						 // If it's the first diff, assign the owner
						 if (previousResults.length === 0)
							 results.push({part:part, owner:texts[i].owner});
						 else{
							 
							 remaining = part.count;
							 // Checking the contributions' owners
							 for (var x in previousResults){
								 
								 // The owners of all characters of the previous part/result have 
								 // already been discovered
								 if (previousResults[x].used == true)
									 continue;
								 
								 // if the new part is larger than the previous part then we must split
								 // to assign owners
								if (part.count > previousResults[x].part.count){
									
									// If the number of characters of the new part is equals to the number of 
									// characters already discovered plus (+) the number of characters in the 
									// mutation (added or modified) then we have to discard the previous part
									if (previousResults[x].part.count != (previousResults[x].usedCharacters + mutation)){
										
										// Find the number of characters that will be used to cut the string/value of the new part
										var tmpAmount = previousResults[x].part.count - previousResults[x].usedCharacters;
										// Check the number of characters of the previous part/result is not greater than the remainder
										var amount = tmpAmount > remaining ? remaining : tmpAmount;
										
										
										var value = part.value.substring(discovered, discovered + amount)
										var newPart = {count:value.length, value:value};
										results.push({part:newPart, owner:previousResults[x].owner});
										
										// Updating the number of discovered and remaining characters
										discovered += amount;
										remaining = part.count - discovered;
										
										// Saves the number of characters already discovered in the previous part/result
										previousResults[x].usedCharacters += amount;
										
										// Mark the previous part/result because all of the characters were discovered 
										if (previousResults[x].usedCharacters >= previousResults[x].part.count ){
											previousResults[x].used = true;
											mutation = 0;
										}
									}
									else{
										// if it is a change in the word then discard the previous part/result
										previousResults[x].used = true;
										mutation = 0;
										continue;
									} 
								}
								else {
									results.push({part:part, owner:previousResults[x].owner});
									
									// Stores the number of characters that have already been identified owners
									previousResults[x].usedCharacters += part.value.length;
									discovered += part.count;
									// Eliminates possibility of negative number
									remaining = Math.abs(part.count - discovered);
									
									// Mark the previous part/result because all of the characters were discovered 
									//TODO test to see if we can sum the mutation with the number of previous characters
									if ((previousResults[x].usedCharacters + mutation) >= previousResults[x].part.count )
										previousResults[x].used = true;
									
									break;											 
								}
								
							 }
						 }
					 }
					 previous += part.value;
				}
			});
			
			previousResults = results;
			// Releases all markings made on results obtained
			previousResults = this.freeResults(previousResults);
			
		}
		return results;
}
	
function freeResults(previousResults){
	for (var x in previousResults){
		previousResults[x].used = false;
		previousResults[x].usedCharacters = 0;
	}
	return previousResults;
}