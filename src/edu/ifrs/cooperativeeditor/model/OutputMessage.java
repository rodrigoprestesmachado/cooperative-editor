/**
 * @license
 * Copyright 2018, Instituto Federal do Rio Grande do Sul (IFRS)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * 		http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package edu.ifrs.cooperativeeditor.model;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;

public class OutputMessage {

	private String type;
	private HashMap<String, String> map;

	public OutputMessage(){
		map = new HashMap<String, String>();
	}
	
	public void clear() {
		map.clear();
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = "ACK_"+type;
	}
	
	public HashMap<String, String> getMap() {
		return map;
	}

	public void setMap(HashMap<String, String> map) {
		this.map = map;
	}
	
	public void addData(String key, String value){
		this.map.put(key, value);
	}
	
	/**
	 * Converts to JSON format
	 */
	public String toString(){
		StringBuilder json = new StringBuilder();
		json.append("{\"type\":\""+this.type+"\"");
		
		if(map.isEmpty()){
			json.append("}");
		}
		else{
			Iterator<Entry<String, String>> iterator = this.map.entrySet().iterator();
			while (iterator.hasNext()) {
				Entry<String, String> pair = iterator.next();
				json.append(",\""+ pair.getKey() +"\":");
				
				String value = pair.getValue().trim();
				if (value.startsWith("{") || value.contains("["))
					json.append(pair.getValue());
				else
					json.append("\""+ pair.getValue()+"\"");
			}
			json.append("}");
		}
		return json.toString();
	}

}