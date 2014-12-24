import os.path
import sys

def show_msg(text):
	sys.stdout.write(text)

def show_err(text):
	sys.stderr.write(text)

def do_read():
	return sys.stdin.read()

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

		"../src/THREEx.Plot3dColors.js",
		"../src/THREEx.Plot3d.js",
	]
	output_file = "THREEx.Plot3d.full.js"
	output_file_min = output_file.replace(".js", ".min.js")
	js_text = ""
	for js_file_name in js_files:
		if not os.path.exists(js_file_name):
			show_err("File '%s' is not found\n" % (js_file_name))
			continue
		with open(js_file_name, "r") as js_file: js_text += "// %s\n\n%s\n" % (js_file_name, js_file.read()) 
		show_msg("'%s' is loaded\n" % js_file_name)
	with open(output_file, 'w') as js_output: js_output.write(js_text)
	show_msg("Combined file is saved to '%s'\n" % output_file)

def get_git_comment():
	max_attempts = 5
	comment = ""
	while not len(comment):
		show_msg("Git comment: ")
		comment = do_read()
		if not comment: show_err("Git comment can't be empty\n")
		max_attempts -= 1
		if not max_attempts:
			show_err("No comment was entered. Git commit is aborted.\n")
			return None
	return comment

def git_commit():
	comment = get_git_comment()
	if comment is None: return
	current_path = os.path.realpath(__file__);
	current_path_level_up = os.path.abspath(current_path, '..', '/')
	os.path.dirname(current_path_level_up)
	os.system("git add .")
	os.system("git commit -am '%s'")

if __name__ == "__main__":
	combine_files()
	#git_commit()