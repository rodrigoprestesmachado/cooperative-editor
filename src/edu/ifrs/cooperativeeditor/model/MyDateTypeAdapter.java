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

import java.io.IOException;
import java.util.Calendar;

import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

//Class used by GsonBuilder to convert DateType to Calendar, this in json transformation into object

public class MyDateTypeAdapter extends TypeAdapter<Calendar> {

	@Override
	public void write(JsonWriter out, Calendar value) throws IOException {
		if (value == null)
			out.nullValue();
		else
			out.value(value.getTimeInMillis());
	}

	@Override
	public Calendar read(JsonReader in) throws IOException {
		Calendar calendar = Calendar.getInstance();
		if (in != null) {
			calendar.setTimeInMillis(in.nextLong());
			return calendar;
		} else
			return null;
	}
}
