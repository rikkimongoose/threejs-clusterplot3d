import os.path, sys, fnmatch, shutil
import httplib, urllib, urllib2
import getopt

def show_msg(text):
	sys.stdout.write(text)

def show_err(text):
	sys.stderr.write(text)

def do_read():
	return sys.stdin.read()

def update_demos(js_file_path):
	demo_folder = "../demo"
	js_file_name = os.path.basename(js_file_path)
	for root, dirnames, filenames in os.walk(demo_folder):
		for filename in fnmatch.filter(filenames, js_file_name):
			demo_js_filename = os.path.join(root, filename)
			print "replacing %s" % (demo_js_filename)
			shutil.copy2(js_file_path, demo_js_filename)

def compress_js(js_code):
	headers = {'User-Agent' : 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'}
	url = 'http://javascript-minifier.com/raw'
	values = { 'input': js_code }
	data = urllib.urlencode(values)
	req = urllib2.Request(url, data, headers)
	
	try:
		response = urllib2.urlopen(req)
	except HTTPError as e:
		show_err('The server couldn\'t fulfill the request. Error code: %s' % e.code)
		return None
	except URLError as e:
		show_err('We failed to reach a server. Reason: %s' % e.reason)
		return None
	else:
		result = response.read()
		return result

def compress_js_items(js_to_compress, output_file_min):
	show_msg("Minify JavaScript...\n")
	js_output_min = ""
	for js_file_data in js_to_compress:
		if js_file_data[1]:
			compressed_js = compress_js(js_file_data[0])
			if compressed_js is None:
				return False
			js_output_min += compressed_js
		else:
			js_output_min += js_file_data[0]
	with open(output_file_min, 'w') as js_output: js_output.write(js_output_min)
	return True

def combine_files():
	js_files = [
		"../src/external/fonts/droid/droid_sans_bold.typeface.js",
		"../src/external/fonts/droid/droid_sans_mono_regular.typeface.js",
		"../src/external/fonts/droid/droid_sans_regular.typeface.js",
		"../src/external/fonts/droid/droid_serif_bold.typeface.js",
		"../src/external/fonts/droid/droid_serif_regular.typeface.js",
		"../src/external/fonts/gentilis_bold.typeface.js",
		"../src/external/fonts/gentilis_regular.typeface.js",
		"../src/external/fonts/helvetiker_bold.typeface.js",
		"../src/external/fonts/helvetiker_regular.typeface.js",
		"../src/external/fonts/optimer_bold.typeface.js",
		"../src/external/fonts/optimer_regular.typeface.js",
		
		"../src/external/Detector.js",
		"../src/external/OrbitControls.js",
		"../src/external/Stats.js",

		"../src/external/THREEx.KeyboardState.js",
		"../src/external/THREEx.FullScreen.js",
		"../src/external/THREEx.WindowResize.js",

		"../src/THREEx.Plot3d.Colors.js",
		"../src/THREEx.UrlUtils.js",
		"../src/THREEx.Plot3d.Main.js",
	]

	# no need to minify font files
	js_no_min = [
		"../src/external/fonts/*",
		"*.min"
	]

	js_to_compress = []

	output_file = "THREEx.Plot3d.js"
	output_file_min = output_file.replace(".js", ".min.js")
	js_text = ""
	js_text_to_min = ""
	source_text = ""
	for js_file_name in js_files:
		if not os.path.exists(js_file_name):
			show_err("File '%s' is not found\n" % (js_file_name))
			continue
		with open(js_file_name, "r") as js_file: source_text = js_file.read() + '\n'
		js_text += "// %s\n\n%s" % (js_file_name, source_text)
		if next((mask for mask in js_no_min if fnmatch.fnmatch(js_file_name, mask)), None) is not None:
			show_msg("'%s' is already minified.\n" % js_file_name)
			js_to_compress.append((js_text_to_min, True))
			js_to_compress.append((source_text, False))
			js_text_to_min = ""
		else:
			js_text_to_min += source_text
		if len(js_text_to_min):
			js_to_compress.append((js_text_to_min, True))
		show_msg("'%s' is loaded\n" % js_file_name)
	with open(output_file, 'w') as js_output: js_output.write(js_text)
	show_msg("Combined file is saved to '%s'\n" % output_file)
	update_demos(output_file)

	if compress_js_items(js_to_compress, output_file_min):
		show_msg("Minified file is saved to '%s'\n" % output_file_min)
		update_demos(output_file_min)
	else:
		show_err('Unable to minify file. Updating minified versions is aborted.')

def usage():
	help_msg = "Combines all used JS modules in same javascript file and minify it."
	show_msg(help_msg)

def main():
    do_git_commit = False
    try:
        opts, args = getopt.getopt(sys.argv[1:], "gh", ["git", "help"])
    except getopt.GetoptError as err:
        show_err(err)
        usage()
    for o, a in opts:
        if o == "-h":
            usage()
    combine_files()

if __name__ == "__main__":
	main()